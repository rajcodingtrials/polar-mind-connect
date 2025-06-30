
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Send, X, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import VoiceRecorder from './chat/VoiceRecorder';
import ChatMessage from './chat/ChatMessage';
import { calculateSimilarity } from './chat/fuzzyMatching';
import type { Message, Question, ChatMessageProps, VoiceRecorderProps } from './chat/types';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface OpenAIChatProps {
  onClose: () => void;
  questions: Question[];
  imageUrls: {[key: string]: string};
  useStructuredMode: boolean;
  onToggleMode: () => void;
  selectedQuestionType: QuestionType;
  onCorrectAnswer: () => void;
}

const OpenAIChat: React.FC<OpenAIChatProps> = ({
  onClose,
  questions,
  imageUrls,
  useStructuredMode,
  onToggleMode,
  selectedQuestionType,
  onCorrectAnswer
}) => {
  console.log('🎯 === OPENAI CHAT COMPONENT LOADED ===');
  console.log('OpenAIChat received questions:', questions.length);
  console.log('Questions:', questions);
  console.log('Available image URLs:', Object.keys(imageUrls));
  console.log('Selected question type:', selectedQuestionType);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [ttsSettings, setTtsSettings] = useState({ voice: 'nova', speed: 1, enableSSML: false });
  const [autoPlayTTS, setAutoPlayTTS] = useState(true);
  const [speechDelayMode, setSpeechDelayMode] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isPlaying, stopAudio } = useAudioPlayer();
  
  // Audio recording functionality
  const { isRecording, isProcessing, setIsProcessing, startRecording, stopRecording } = useAudioRecorder();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadTTSSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('tts_settings')
          .select('*')
          .single();
        
        if (error) {
          console.error('Error loading TTS settings:', error);
          return;
        }
        
        if (data) {
          setTtsSettings({
            voice: data.voice,
            speed: Number(data.speed),
            enableSSML: data.enable_ssml
          });
          console.log('TTS Settings from database:', {
            voice: data.voice,
            speed: Number(data.speed),
            enableSSML: data.enable_ssml
          });
        }
      } catch (error) {
        console.error('Error loading TTS settings:', error);
      }
    };

    loadTTSSettings();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      sendInitialMessage();
    }
  }, [selectedQuestionType, useStructuredMode]);

  const handleVoiceRecording = async () => {
    if (isRecording) {
      console.log('Stopping recording...');
      setIsProcessing(true);
      
      try {
        const base64Audio = await stopRecording();
        console.log('Recording stopped, processing audio...');
        
        // Send audio to speech-to-text
        const { data, error } = await supabase.functions.invoke('openai-stt', {
          body: { audio: base64Audio }
        });

        if (error) {
          console.error('Speech-to-text error:', error);
          toast({
            title: "Voice Recognition Error",
            description: "Failed to process your voice. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data?.text && data.text.trim()) {
          console.log('Transcription received:', data.text);
          await sendMessage(data.text.trim());
        } else {
          console.log('No speech detected');
          toast({
            title: "No Speech Detected",
            description: "Please try speaking again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error processing voice recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to process voice recording. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log('Starting recording...');
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Microphone Error",
          description: "Failed to access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const getBasePrompt = () => {
    return `You are Laura, a warm, encouraging, and patient AI speech therapy assistant designed specifically for children. Your personality traits include:

- You speak in a friendly, upbeat tone that makes children feel comfortable
- You use age-appropriate language and explanations
- You celebrate every effort and progress, no matter how small
- You provide gentle correction and encouragement when needed
- You make learning fun through positive reinforcement
- You are patient and never rush the child
- You ask simple, clear questions that are easy to understand
- You use emojis and enthusiastic language to keep children engaged

Remember to always be supportive, encouraging, and make the child feel proud of their efforts in speech therapy practice.`;
  };

  const sendInitialMessage = async () => {
    console.log('🚀 === SENDING INITIAL MESSAGE ===');
    console.log('Component state:', {
      selectedQuestionType,
      useStructuredMode,
      questionsLength: questions.length
    });
    
    setIsLoading(true);
    
    try {
      let initialMessage: Message;
      
      if (useStructuredMode && questions.length > 0) {
        // For structured mode with questions, generate intro then immediately show first question
        console.log('📡 Calling openai-chat edge function for structured mode intro...');
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [{
              role: 'user',
              content: `Start the ${selectedQuestionType} activity with a warm introduction, but do not ask any questions yet. Just introduce yourself and the activity.`
            }],
            activityType: selectedQuestionType,
            customInstructions: getBasePrompt()
          }
        });

        if (error) {
          console.error('❌ Error calling OpenAI chat function:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to Laura. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data?.choices?.[0]?.message?.content) {
          const firstQuestion = questions[0];
          
          // Combine intro with first question
          const combinedContent = `${data.choices[0].message.content}

Now, let's look at this picture! ${firstQuestion.question}`;

          initialMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: combinedContent,
            timestamp: new Date(),
            imageUrl: firstQuestion.imageName && imageUrls[firstQuestion.imageName] ? imageUrls[firstQuestion.imageName] : undefined
          };
          
          setIsWaitingForAnswer(true);
        } else {
          console.log('⚠️ No content received from AI for intro');
          return;
        }
      } else {
        // For free chat mode, use OpenAI to generate initial greeting
        console.log('📡 Calling openai-chat edge function...');
        console.log('Request payload:', {
          messages: [],
          activityType: selectedQuestionType,
          customInstructions: getBasePrompt()
        });
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [],
            activityType: selectedQuestionType,
            customInstructions: getBasePrompt()
          }
        });

        console.log('📥 Edge function response received:');
        console.log('Data:', data);
        console.log('Error:', error);

        if (error) {
          console.error('❌ Error calling OpenAI chat function:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to Laura. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data?.choices?.[0]?.message?.content) {
          initialMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.choices[0].message.content,
            timestamp: new Date()
          };
        } else {
          console.log('⚠️ No content received from AI');
          return;
        }
      }

      console.log('💬 Initial message created:', initialMessage);
      setMessages([initialMessage]);
      
    } catch (error) {
      console.error('💥 Error in sendInitialMessage:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    console.log('📤 Sending user message:', messageContent);
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    
    try {
      if (useStructuredMode && isWaitingForAnswer && questions[currentQuestionIndex]) {
        // Handle structured mode with predefined questions
        const currentQuestion = questions[currentQuestionIndex];
        
        // Use enhanced similarity calculation with speech delay mode
        const similarity = calculateSimilarity(messageContent, currentQuestion.answer, {
          speechDelayMode,
          threshold: speechDelayMode ? 0.4 : 0.6 // Lower threshold for speech delay mode
        });
        
        console.log(`Similarity score: ${similarity} (Speech delay mode: ${speechDelayMode})`);
        
        let responseMessage: Message;
        
        // Lower acceptance threshold in speech delay mode
        const acceptanceThreshold = speechDelayMode ? 0.5 : 0.7;
        
        if (similarity > acceptanceThreshold) {
          // Correct answer
          onCorrectAnswer();
          
          if (currentQuestionIndex + 1 < questions.length) {
            // Move to next question
            const nextQuestion = questions[currentQuestionIndex + 1];
            responseMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `That's amazing! Great job! 🎉\n\nLet's try the next one:\n\n${nextQuestion.question}`,
              timestamp: new Date(),
              imageUrl: nextQuestion.imageName && imageUrls[nextQuestion.imageName] ? imageUrls[nextQuestion.imageName] : undefined
            };
            setCurrentQuestionIndex(prev => prev + 1);
          } else {
            // All questions completed
            responseMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Excellent work! 🌟 You've completed all the questions! I'm so proud of you!`,
              timestamp: new Date()
            };
            setIsWaitingForAnswer(false);
          }
        } else {
          // Incorrect answer - encourage and give hint
          responseMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Good try! Let me help you. Look at the picture carefully and try again. What do you see?`,
            timestamp: new Date(),
            imageUrl: currentQuestion.imageName && imageUrls[currentQuestion.imageName] ? imageUrls[currentQuestion.imageName] : undefined
          };
        }
        
        setMessages([...updatedMessages, responseMessage]);
      } else {
        // Free chat mode or general conversation
        console.log('📡 Calling openai-chat edge function with conversation...');
        console.log('Messages to send:', updatedMessages.map(m => ({ role: m.role, content: m.content })));
        console.log('Activity type:', selectedQuestionType);
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            activityType: selectedQuestionType,
            customInstructions: getBasePrompt()
          }
        });

        console.log('📥 Edge function response:');
        console.log('Response data:', data);
        console.log('Response error:', error);

        if (error) {
          console.error('❌ Error calling OpenAI chat function:', error);
          toast({
            title: "Error",
            description: "Failed to get response from Laura. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data?.choices?.[0]?.message?.content) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.choices[0].message.content,
            timestamp: new Date()
          };

          setMessages([...updatedMessages, aiMessage]);
        }
      }
    } catch (error) {
      console.error('💥 Error sending message:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Present first question after introduction in structured mode with proper audio state checking
  useEffect(() => {
    if (useStructuredMode && isWaitingForAnswer && messages.length === 1 && questions.length > 0) {
      setIsWaitingForAnswer(false);
    }
  }, [useStructuredMode, isWaitingForAnswer, messages.length, questions.length]);

  const getCurrentQuestion = () => {
    if (!useStructuredMode || !questions.length) return null;
    return questions[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="w-full h-[600px] flex flex-col bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-3xl shadow-xl overflow-hidden">
      {/* Header with Laura's image and controls */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
              <AvatarImage 
                src="/lovable-uploads/Laura.png" 
                alt="Laura - Speech Therapist" 
              />
              <AvatarFallback className="bg-blue-200 text-blue-800 text-lg font-semibold">L</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Laura</h2>
              <p className="text-blue-700 text-sm font-normal">
                Your AI Speech Therapy Assistant
              </p>
              {useStructuredMode && (
                <p className="text-blue-600 text-xs">
                  Q&A Mode: {currentQuestionIndex + 1}/{questions.length}
                  {speechDelayMode && <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">Speech Delay Mode</span>}
                </p>
              )}
              {(isRecording || isProcessing) && (
                <p className="text-rose-600 text-xs font-medium animate-pulse">
                  {isRecording ? "🔴 Recording... Tap the mic again to stop" : "🔄 Processing your voice..."}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {useStructuredMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpeechDelayMode(!speechDelayMode)}
                className={`border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-sm ${
                  speechDelayMode ? "bg-purple-100 border-purple-300" : ""
                }`}
                title={speechDelayMode ? "Speech Delay Mode ON" : "Speech Delay Mode OFF"}
              >
                {speechDelayMode ? "🧠 ON" : "🧠 OFF"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            ttsSettings={ttsSettings}
            autoPlayTTS={autoPlayTTS}
            onAudioStateChange={setIsGeneratingAudio}
          />
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
              disabled={isLoading || isRecording || isProcessing}
              className="pr-12 border-blue-200 focus:border-blue-400"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim() || isRecording || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleVoiceRecording}
            disabled={isLoading || isProcessing}
            className="shrink-0 px-3"
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-center mt-2 text-blue-600 text-sm">
          {isRecording ? "Recording... Tap microphone to stop" : 
           isProcessing ? "Processing your voice..." :
           "Tap microphone to answer"}
        </div>
      </div>
    </div>
  );
};

export default OpenAIChat;
