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
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [ttsSettings, setTtsSettings] = useState({ voice: 'nova', speed: 1, enableSSML: false });
  const [autoPlayTTS, setAutoPlayTTS] = useState(true);
  const [speechDelayMode, setSpeechDelayMode] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  // Stop audio when component unmounts (window closes)
  useEffect(() => {
    return () => {
      console.log('OpenAIChat component unmounting, stopping all audio...');
      stopAudio();
      // Stop any ongoing recording
      if (isRecording) {
        stopRecording().catch(console.error);
      }
      // Stop any processing
      setIsProcessing(false);
    };
  }, [stopAudio, isRecording, stopRecording]);

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
      let promptContent: string;
      
      if (useStructuredMode && questions.length > 0) {
        const firstQuestion = questions[0];
        console.log('First question:', firstQuestion);
        
        // Single API call that combines introduction and first question
        promptContent = `Please provide a warm introduction for starting the ${selectedQuestionType} activity, followed by asking this specific question from our database:

Question: "${firstQuestion.question}"
Expected Answer: "${firstQuestion.answer}"

Structure your response as:
1. A warm, encouraging introduction to the activity
2. Then ask the exact question provided above (do not modify the question)

Make it all flow naturally as one cohesive message.`;

        console.log('📡 Calling openai-chat edge function for unified introduction + question...');
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [{
              role: 'user', 
              content: promptContent
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
          initialMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.choices[0].message.content,
            timestamp: new Date(),
            imageUrl: firstQuestion.imageName && imageUrls[firstQuestion.imageName] ? imageUrls[firstQuestion.imageName] : undefined
          };
          
          setMessages([initialMessage]);
          setIsWaitingForAnswer(true); // We're now waiting for answer to the first question
        } else {
          console.log('⚠️ No content received from AI');
          return;
        }
      } else {
        // Free chat mode
        promptContent = `Please provide a warm, encouraging introduction for a ${selectedQuestionType} session.`;
        
        console.log('📡 Calling openai-chat edge function for free chat...');
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [{
              role: 'user', 
              content: promptContent
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
          initialMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.choices[0].message.content,
            timestamp: new Date()
          };
          
          setMessages([initialMessage]);
        } else {
          console.log('⚠️ No content received from AI');
          return;
        }
      }
      
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
    
    try {
      if (useStructuredMode && isWaitingForAnswer && questions[currentQuestionIndex]) {
        // Handle structured mode with predefined questions
        const currentQuestion = questions[currentQuestionIndex];
        
        const similarity = calculateSimilarity(messageContent, currentQuestion.answer, {
          speechDelayMode,
          threshold: speechDelayMode ? 0.4 : 0.6
        });
        
        console.log(`Similarity score: ${similarity} (Speech delay mode: ${speechDelayMode})`);
        
        let responseMessage: Message;
        
        const acceptanceThreshold = speechDelayMode ? 0.4 : 0.7;
        
        if (similarity > acceptanceThreshold) {
          onCorrectAnswer();
          
          if (currentQuestionIndex + 1 < questions.length) {
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
            responseMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Excellent work! 🌟 You've completed all the questions! I'm so proud of you!`,
              timestamp: new Date()
            };
            setIsWaitingForAnswer(false);
          }
        } else {
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
        
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            activityType: selectedQuestionType,
            customInstructions: getBasePrompt()
          }
        });

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

  const getCurrentQuestion = () => {
    if (!useStructuredMode || !questions.length) return null;
    return questions[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

  const handleClose = () => {
    console.log('Closing chat, stopping all audio...');
    // Set closing state to force stop all audio in ChatMessage components
    setIsClosing(true);
    // Stop any playing audio
    stopAudio();
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording().catch(console.error);
    }
    // Stop any processing
    setIsProcessing(false);
    // Close the chat
    onClose();
  };

  return (
    <div className="w-full h-[800px] flex flex-col bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-3xl shadow-xl overflow-hidden">
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
            <Button variant="ghost" size="sm" onClick={handleClose}>
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
            forceStopAudio={isClosing}
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

      {/* Voice-only Input Interface */}
      <div className="border-t border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex flex-col items-center space-y-3">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleVoiceRecording}
            disabled={isLoading || isProcessing}
            className="w-16 h-16 rounded-full border-2 border-blue-300 hover:border-blue-400"
          >
            {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
          <div className="text-center text-blue-600 text-sm font-medium">
            Tap to answer
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAIChat;
