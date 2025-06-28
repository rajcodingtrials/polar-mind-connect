
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import VoiceRecorder from './chat/VoiceRecorder';
import { 
  selectRandomQuestions, 
  createConversationalLessonPlan, 
  addPausesAfterQuestions 
} from './chat/utils';
import { Message, Question, OpenAIChatProps } from './chat/types';

const OpenAIChat = ({ 
  onClose, 
  questions = [], 
  imageUrls = {}, 
  useStructuredMode = false, 
  onToggleMode, 
  selectedQuestionType, 
  onCorrectAnswer 
}: OpenAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
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

  const startConversation = async () => {
    setLoading(true);
    setMessages([]);

    try {
      let assistantContent = '';

      if (useStructuredMode && selectedQuestionType) {
        let selectedQuestions: Question[] = [];
        let activityDescription = '';
        
        // Handle different question types with custom instructions
        switch (selectedQuestionType) {
          case 'first_words':
            selectedQuestions = questions.filter(q => q.questionType === 'first_words').slice(0, 5);
            activityDescription = 'practicing first words and basic sounds';
            break;
            
          case 'question_time':
            selectedQuestions = selectRandomQuestions(questions).filter(q => q.questionType === 'question_time');
            activityDescription = 'answering questions about pictures';
            break;
            
          case 'build_sentence':
            selectedQuestions = questions.filter(q => q.questionType === 'build_sentence').slice(0, 5);
            activityDescription = 'building sentences together';
            break;
            
          case 'lets_chat':
            const conversationPlan = createConversationalLessonPlan();
            activityDescription = `having a friendly conversation about ${conversationPlan.topic}`;
            
            setCurrentQuestions([{ id: '1', question: conversationPlan.topic, answer: '', questionType: 'lets_chat' }]);
            break;
            
          default:
            selectedQuestions = selectRandomQuestions(questions);
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
        <CardTitle>
          <ChatHeader
            useStructuredMode={useStructuredMode}
            selectedQuestionType={selectedQuestionType}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={currentQuestions.length}
            isRecording={isRecording}
            isPlaying={isPlaying}
            hasQuestions={questions.length > 0}
            onToggleMode={onToggleMode}
            onToggleAudio={toggleAudio}
            onClose={onClose}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-blue-50">
        <div className="h-[600px] overflow-y-auto border border-blue-200 rounded-lg p-4 space-y-4 bg-gradient-to-b from-white to-blue-50 shadow-inner">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} index={index} />
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
        
        <VoiceRecorder
          isRecording={isRecording}
          isProcessing={isProcessing}
          loading={loading}
          onVoiceRecording={handleVoiceRecording}
        />
      </CardContent>
    </Card>
  );
};

export default OpenAIChat;
