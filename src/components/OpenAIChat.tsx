import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle, FileQuestion } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: string;
}

interface OpenAIChatProps {
  onClose?: () => void;
  questions?: Question[];
  imageUrls?: {[key: string]: string};
  useStructuredMode?: boolean;
  onToggleMode?: () => void;
  selectedQuestionType?: string;
  onCorrectAnswer?: () => void;
}

const OpenAIChat = ({ onClose, questions = [], imageUrls = {}, useStructuredMode = false, onToggleMode, selectedQuestionType, onCorrectAnswer }: OpenAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { toast } = useToast();
  
  const {
    isRecording,
    isProcessing,
    setIsProcessing,
    startRecording,
    stopRecording,
  } = useAudioRecorder();
  
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  // Debug log for questions and images
  useEffect(() => {
    console.log('OpenAIChat received questions:', questions.length);
    console.log('Questions:', questions);
    console.log('Available image URLs:', Object.keys(imageUrls));
    console.log('Selected question type:', selectedQuestionType);
  }, [questions, imageUrls, selectedQuestionType]);

  // Start conversation when component mounts or mode changes
  useEffect(() => {
    if (!hasStarted || (useStructuredMode && currentQuestions.length === 0)) {
      startConversation();
      setHasStarted(true);
    }
  }, [useStructuredMode, selectedQuestionType]);

  const selectRandomQuestions = () => {
    if (questions.length === 0) return [];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(5, questions.length));
  };

  const createConversationalLessonPlan = () => {
    // Simple conversational topics for children
    const topics = [
      'pets and animals',
      'favorite foods',
      'family and friends',
      'toys and games',
      'colors and shapes',
      'school and learning'
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    return { topic: randomTopic };
  };

  // Helper function to determine if a message is a question
  const isQuestionMessage = (content: string): boolean => {
    // Check if the message contains a question mark or typical question patterns
    return content.includes('?') || 
           content.toLowerCase().includes('what') ||
           content.toLowerCase().includes('how') ||
           content.toLowerCase().includes('where') ||
           content.toLowerCase().includes('when') ||
           content.toLowerCase().includes('why') ||
           content.toLowerCase().includes('can you') ||
           content.toLowerCase().includes('tell me');
  };

  // Helper function to add pauses after question marks in text
  const addPausesAfterQuestions = (text: string): string => {
    // Add a pause (represented by a comma and space) after question marks
    return text.replace(/\?/g, '?... ');
  };

  const startConversation = async () => {
    setLoading(true);
    setMessages([]);

    try {
      let customInstructions = '';
      let assistantContent = '';

      if (useStructuredMode && selectedQuestionType) {
        let selectedQuestions: Question[] = [];
        let activityDescription = '';
        
        // Handle different question types with custom instructions
        switch (selectedQuestionType) {
          case 'first_words':
            selectedQuestions = questions.filter(q => q.questionType === 'first_words').slice(0, 5);
            activityDescription = 'practicing first words and basic sounds';
            customInstructions = `Here are the questions you should ask:
            ${selectedQuestions.map((q, i) => `${i + 1}. ${q.question} (Expected answer: ${q.answer})`).join('\n')}
            
            Start with a warm greeting and then ask the first question.`;
            break;
            
          case 'question_time':
            selectedQuestions = selectRandomQuestions().filter(q => q.questionType === 'question_time');
            activityDescription = 'answering questions about pictures';
            customInstructions = `Here are the questions you should ask:
            ${selectedQuestions.map((q, i) => `${i + 1}. ${q.question} (Expected answer: ${q.answer})`).join('\n')}
            
            Start with a warm greeting and then ask the first question.`;
            break;
            
          case 'build_sentence':
            selectedQuestions = questions.filter(q => q.questionType === 'build_sentence').slice(0, 5);
            activityDescription = 'building sentences together';
            customInstructions = `Here are the sentence-building exercises:
            ${selectedQuestions.map((q, i) => `${i + 1}. ${q.question} (Target sentence: ${q.answer})`).join('\n')}
            
            Start with a warm greeting and then begin the first exercise.`;
            break;
            
          case 'lets_chat':
            const conversationPlan = createConversationalLessonPlan();
            activityDescription = `having a friendly conversation about ${conversationPlan.topic}`;
            customInstructions = `The conversation topic is: ${conversationPlan.topic}
            
            Start with a warm greeting and naturally introduce the topic of ${conversationPlan.topic}. 
            Let the conversation develop organically based on their responses.
            Keep the session to about 5-6 exchanges to maintain their attention.`;
            
            setCurrentQuestions([{ id: '1', question: conversationPlan.topic, answer: '', questionType: 'lets_chat' }]);
            break;
            
          default:
            selectedQuestions = selectRandomQuestions();
            activityDescription = 'practicing speech together';
        }

        setCurrentQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);

        console.log('Selected questions for session:', selectedQuestions);

        // Create introductory message first
        const introMessage = `Hello! I'm so excited to work with you today! 🌟 

We're going to be ${activityDescription}. Let's start!`;

        const assistantIntroMessage: Message = {
          role: 'assistant',
          content: introMessage
        };

        setMessages([assistantIntroMessage]);

        // Generate and play TTS for intro with pauses
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
            body: { 
              text: addPausesAfterQuestions(introMessage),
              voice: 'nova'
            }
          });

          if (!ttsError && ttsData.audioContent) {
            await playAudio(ttsData.audioContent);
          }
        } catch (ttsError) {
          console.error('TTS Error:', ttsError);
        }

        // Wait a moment, then start with first question or conversation starter
        setTimeout(async () => {
          let firstContent = '';
          let firstMessage: Message;

          if (selectedQuestionType === 'lets_chat') {
            const conversationPlan = createConversationalLessonPlan();
            firstContent = `I'd love to chat with you about ${conversationPlan.topic}! Tell me, what do you think about ${conversationPlan.topic}?`;
          } else {
            const firstQuestion = selectedQuestions[0];
            firstContent = `Let's start with the first one:

${firstQuestion?.question}`;
          }

          firstMessage = {
            role: 'assistant',
            content: firstContent
          };

          // Add image for non-chat questions
          if (selectedQuestionType !== 'lets_chat') {
            const firstQuestion = selectedQuestions[0];
            if (firstQuestion && firstQuestion.imageName && imageUrls[firstQuestion.imageName]) {
              firstMessage.imageUrl = imageUrls[firstQuestion.imageName];
              console.log('Adding image to first question:', firstQuestion.imageName, firstMessage.imageUrl);
            }
          }

          setMessages(prev => [...prev, firstMessage]);

          // Generate and play TTS for first question with pauses
          try {
            const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
              body: { 
                text: addPausesAfterQuestions(firstContent),
                voice: 'nova'
              }
            });

            if (!ttsError && ttsData.audioContent) {
              await playAudio(ttsData.audioContent);
            }
          } catch (ttsError) {
            console.error('TTS Error:', ttsError);
          }
        }, 2000); // 2 second delay after intro

      } else {
        // Free chat mode - use default activity type
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [],
            model: 'gpt-4o-mini',
            activityType: 'default'
          }
        });

        if (error) throw error;
        assistantContent = data.choices[0].message.content;

        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent
        };

        setMessages([assistantMessage]);

        // Generate and play TTS for Laura's response
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
            body: { 
              text: assistantContent,
              voice: 'nova'
            }
          });

          if (!ttsError && ttsData.audioContent) {
            await playAudio(ttsData.audioContent);
          }
        } catch (ttsError) {
          console.error('TTS Error:', ttsError);
        }
      }

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation with Laura. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let assistantContent = '';

      if (useStructuredMode && currentQuestions.length > 0) {
        if (selectedQuestionType === 'lets_chat') {
          // Handle natural conversation mode
          const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
          
          const { data, error } = await supabase.functions.invoke('openai-chat', {
            body: {
              messages: [...conversationHistory, userMessage],
              model: 'gpt-4o-mini',
              activityType: 'lets_chat'
            }
          });

          if (error) throw error;
          assistantContent = data.choices[0].message.content;
        } else {
          // Handle other question types with expected answers
          const currentQ = currentQuestions[currentQuestionIndex];
          const isCorrect = messageText.toLowerCase().includes(currentQ.answer.toLowerCase());
          const nextIndex = currentQuestionIndex + 1;

          if (isCorrect) {
            // Trigger progress character update
            onCorrectAnswer?.();
            
            if (nextIndex < currentQuestions.length) {
              // First show congratulatory message without image
              assistantContent = `Wonderful! That's exactly right! 🎉`;
              
              const congratulatoryMessage: Message = {
                role: 'assistant',
                content: assistantContent
              };

              setMessages(prev => [...prev, congratulatoryMessage]);

              // Generate and play TTS for congratulatory message with pauses
              try {
                const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
                  body: { 
                    text: addPausesAfterQuestions(assistantContent),
                    voice: 'nova'
                  }
                });

                if (!ttsError && ttsData.audioContent) {
                  await playAudio(ttsData.audioContent);
                }
              } catch (ttsError) {
                console.error('TTS Error:', ttsError);
              }

              // Wait a moment, then show next question with image
              setTimeout(async () => {
                const nextQ = currentQuestions[nextIndex];
                const nextQuestionContent = `Now let's look at the next picture. ${nextQ.question}`;
                
                const nextQuestionMessage: Message = {
                  role: 'assistant',
                  content: nextQuestionContent
                };

                // Add image to next question
                if (nextQ.imageName && imageUrls[nextQ.imageName]) {
                  nextQuestionMessage.imageUrl = imageUrls[nextQ.imageName];
                  console.log('Adding next question image:', nextQ.imageName);
                }

                setMessages(prev => [...prev, nextQuestionMessage]);
                setCurrentQuestionIndex(nextIndex);

                // Generate and play TTS for next question with pauses
                try {
                  const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
                    body: { 
                      text: addPausesAfterQuestions(nextQuestionContent),
                      voice: 'nova'
                    }
                  });

                  if (!ttsError && ttsData.audioContent) {
                    await playAudio(ttsData.audioContent);
                  }
                } catch (ttsError) {
                  console.error('TTS Error:', ttsError);
                }
              }, 1500); // 1.5 second delay

              setLoading(false);
              return; // Exit early to avoid duplicate processing
            } else {
              assistantContent = `Perfect! You got it right! 🌟 

You did such an amazing job answering all the questions today! You should be very proud of yourself. Great work! 🎊`;
            }
          } else {
            assistantContent = `That's a good try! The answer I was looking for is "${currentQ.answer}". Let's try saying it together: ${currentQ.answer}. You're doing great! 

Now, can you tell me what you see in this picture again?`;
          }
        }
      } else {
        // Free chat mode
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [...messages, userMessage],
            model: 'gpt-4o-mini',
            activityType: 'default'
          }
        });

        if (error) throw error;
        assistantContent = data.choices[0].message.content;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent
      };

      // Add image for structured mode questions (incorrect answers or final message)
      if (useStructuredMode && currentQuestions.length > 0 && selectedQuestionType !== 'lets_chat') {
        const currentQ = currentQuestions[currentQuestionIndex];
        const isCorrect = messageText.toLowerCase().includes(currentQ.answer.toLowerCase());
        
        if (!isCorrect) {
          // User answered incorrectly - show current question's image again
          if (currentQ.imageName && imageUrls[currentQ.imageName]) {
            assistantMessage.imageUrl = imageUrls[currentQ.imageName];
            console.log('Adding current question image again:', currentQ.imageName);
          }
        }
        // If correct and last question, no image needed
      }

      setMessages(prev => [...prev, assistantMessage]);

      // Generate and play TTS for Laura's response with pauses
      try {
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
          body: { 
            text: addPausesAfterQuestions(assistantContent),
            voice: 'nova'
          }
        });

        if (!ttsError && ttsData.audioContent) {
          await playAudio(ttsData.audioContent);
        }
      } catch (ttsError) {
        console.error('TTS Error:', ttsError);
      }

    } catch (error) {
      console.error('Error calling OpenAI:', error);
      toast({
        title: "Error",
        description: "Failed to get response from Laura. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      try {
        setIsProcessing(true);
        const audioData = await stopRecording();
        
        console.log('Audio recording stopped, processing speech-to-text...');
        
        // Convert speech to text
        const { data, error } = await supabase.functions.invoke('openai-stt', {
          body: { audio: audioData }
        });

        if (error) throw error;
        
        if (data.text) {
          console.log('Speech-to-text completed');
          await sendMessage(data.text);
        }
      } catch (error) {
        console.error('Error processing voice:', error);
        toast({
          title: "Error",
          description: "Failed to process voice recording. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Error",
          description: "Failed to access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-blue-200 bg-blue-50">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200 p-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
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
                  {selectedQuestionType === 'lets_chat' ? 'Conversation Mode' : 'Q&A Mode'}: {currentQuestionIndex + 1}/{currentQuestions.length}
                </p>
              )}
              {isRecording && (
                <p className="text-rose-600 text-xs font-medium animate-pulse">
                  🔴 Recording... Tap the mic again to stop
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && onToggleMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleMode}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                title={useStructuredMode ? "Switch to Free Chat" : "Switch to Q&A Mode"}
              >
                {useStructuredMode ? <MessageCircle className="w-4 h-4" /> : <FileQuestion className="w-4 h-4" />}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAudio}
              disabled={!isPlaying}
              className={`border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm ${
                isPlaying ? "bg-blue-100 border-blue-300" : ""
              }`}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-blue-50">
        <div className="h-[600px] overflow-y-auto border border-blue-200 rounded-lg p-4 space-y-4 bg-gradient-to-b from-white to-blue-50 shadow-inner">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-900 border border-blue-300'
                      : 'bg-white border border-blue-200 text-blue-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src="/lovable-uploads/Laura.png" 
                          alt="Laura" 
                        />
                        <AvatarFallback className="bg-blue-200 text-blue-800 text-xs font-semibold">L</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-blue-700">Laura:</span>
                    </div>
                  )}
                  {message.imageUrl && (
                    <div className="mb-4 flex justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 shadow-inner">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-xl blur-sm"></div>
                        <img 
                          src={message.imageUrl} 
                          alt="Question image" 
                          className="relative max-w-4xl max-h-[500px] object-contain rounded-xl shadow-2xl border-4 border-white ring-2 ring-blue-200/50"
                          onLoad={() => console.log('Image loaded successfully:', message.imageUrl)}
                          onError={(e) => console.error('Image failed to load:', message.imageUrl, e)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-lg">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src="/lovable-uploads/Laura.png" 
                      alt="Laura" 
                    />
                    <AvatarFallback className="bg-blue-200 text-blue-800 text-xs font-semibold">L</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-blue-700">Laura:</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* New bottom bar with microphone */}
        <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-blue-100 to-blue-150 border border-blue-200 rounded-lg p-4">
          <span className="text-blue-800 font-semibold text-lg">Tap microphone to answer</span>
          <button
            onClick={handleVoiceRecording}
            disabled={loading || isProcessing}
            className={`w-12 h-12 rounded-full text-white shadow-lg transition-all duration-300 border-2 flex items-center justify-center ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110 border-red-300" 
                : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 border-blue-300"
            }`}
            title={isRecording ? "Tap to stop recording" : "Tap to start recording"}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {isProcessing && (
          <div className="text-center text-sm text-blue-700 bg-blue-100 p-2 rounded-lg border border-blue-200">
            Processing voice recording...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAIChat;
