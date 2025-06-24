import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
}

interface OpenAIChatProps {
  onClose?: () => void;
  questions?: Question[];
  imageUrls?: {[key: string]: string};
  useStructuredMode?: boolean;
  onToggleMode?: () => void;
}

const OpenAIChat = ({ onClose, questions = [], imageUrls = {}, useStructuredMode = false, onToggleMode }: OpenAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [autoRecordingEnabled, setAutoRecordingEnabled] = useState(false);
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
  }, [questions, imageUrls]);

  // Start conversation when component mounts or mode changes
  useEffect(() => {
    if (!hasStarted || (useStructuredMode && currentQuestions.length === 0)) {
      startConversation();
      setHasStarted(true);
    }
  }, [useStructuredMode]);

  // Auto-start recording after TTS finishes playing
  useEffect(() => {
    if (!isPlaying && autoRecordingEnabled && !isRecording && !isProcessing && !loading) {
      const timer = setTimeout(() => {
        handleAutoRecording();
      }, 1000); // Wait 1 second after TTS stops
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, autoRecordingEnabled, isRecording, isProcessing, loading]);

  const handleAutoRecording = async () => {
    try {
      await startRecording();
      console.log('Auto-recording started');
    } catch (error) {
      console.error('Error starting auto-recording:', error);
      setAutoRecordingEnabled(false);
    }
  };

  const selectRandomQuestions = () => {
    if (questions.length === 0) return [];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(5, questions.length));
  };

  const startConversation = async () => {
    setLoading(true);
    setMessages([]);
    setAutoRecordingEnabled(false);

    try {
      let systemPrompt = '';
      let assistantContent = '';

      if (useStructuredMode && questions.length > 0) {
        const selectedQuestions = selectRandomQuestions();
        setCurrentQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);

        console.log('Selected questions for session:', selectedQuestions);

        systemPrompt = `You are Laura, a gentle speech therapist. You will ask the user specific questions with images. 
        Ask one question at a time and wait for their response. Check if their answer matches the expected answer.
        If correct, praise them warmly. If incorrect, gently correct them and encourage them.
        After they answer, move to the next question.
        
        Here are the 5 questions you should ask:
        ${selectedQuestions.map((q, i) => `${i + 1}. ${q.question} (Expected answer: ${q.answer})`).join('\n')}
        
        Start with a warm greeting and then ask the first question.`;

        // Create introductory message first
        const introMessage = `Hello! I'm so excited to work with you today! 🌟 

I have some special questions with pictures for you.`;

        const assistantIntroMessage: Message = {
          role: 'assistant',
          content: introMessage
        };

        setMessages([assistantIntroMessage]);

        // Generate and play TTS for intro
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
            body: { 
              text: introMessage,
              voice: 'nova'
            }
          });

          if (!ttsError && ttsData.audioContent) {
            await playAudio(ttsData.audioContent);
          }
        } catch (ttsError) {
          console.error('TTS Error:', ttsError);
        }

        // Wait a moment, then show the image and first question
        setTimeout(async () => {
          const firstQuestion = selectedQuestions[0];
          const firstQuestionContent = `Let's start with the first one:

${firstQuestion?.question}`;

          const firstQuestionMessage: Message = {
            role: 'assistant',
            content: firstQuestionContent
          };

          // Add image to the first question
          if (firstQuestion && firstQuestion.imageName && imageUrls[firstQuestion.imageName]) {
            firstQuestionMessage.imageUrl = imageUrls[firstQuestion.imageName];
            console.log('Adding image to first question:', firstQuestion.imageName, firstQuestionMessage.imageUrl);
          } else {
            console.log('No image found for first question:', firstQuestion?.imageName, 'Available images:', Object.keys(imageUrls));
          }

          setMessages(prev => [...prev, firstQuestionMessage]);

          // Generate and play TTS for first question
          try {
            const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
              body: { 
                text: firstQuestionContent,
                voice: 'nova'
              }
            });

            if (!ttsError && ttsData.audioContent) {
              await playAudio(ttsData.audioContent);
              // Enable auto-recording after first question
              setAutoRecordingEnabled(true);
            }
          } catch (ttsError) {
            console.error('TTS Error:', ttsError);
          }
        }, 2000); // 2 second delay after intro

      } else {
        // ... keep existing code (free chat mode initialization)
        systemPrompt = `You are Laura, a gentle and supportive virtual speech therapist for young children with speech delays or sensory needs.

When the conversation starts:
- Greet the child warmly and slowly.
- Ask them their name in a calm, friendly tone.
- Use pauses between sentences and speak at 60% of normal voice speed.
- After the child shares their name, say it back gently and with kindness (e.g., "Hi Maya, I'm so happy to see you!").

Then, begin one short and playful speech lesson:
- Teach the names of 3 simple fruits: apple, banana, and orange.
- For each fruit, say the fruit name clearly and slowly, breaking it into syllables. Example: "Aaa–pple"
- Ask the child kindly to try saying it with you
- Praise any response warmly, even if it's incomplete. Use phrases like: "That's amazing!", "Great trying!", or "I'm so proud of you!"
- You can use fruit emojis to make the lesson more engaging: 🍎 for apple, 🍌 for banana, 🍊 for orange

Keep your sentences short, joyful, and slow. Avoid complex words. Smile in your voice. Always stay calm and patient.

At the end:
- Praise the child by name
- Remind them they did something special today
- Say goodbye in a sweet and happy way`;

        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [],
            model: 'gpt-4o-mini',
            systemPrompt
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
            // Enable auto-recording after initial message in free chat mode
            setAutoRecordingEnabled(true);
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
    setAutoRecordingEnabled(false); // Disable auto-recording while processing

    try {
      let systemPrompt = '';
      let assistantContent = '';

      if (useStructuredMode && currentQuestions.length > 0) {
        const currentQ = currentQuestions[currentQuestionIndex];
        const isCorrect = messageText.toLowerCase().includes(currentQ.answer.toLowerCase());
        const nextIndex = currentQuestionIndex + 1;

        if (isCorrect) {
          if (nextIndex < currentQuestions.length) {
            // First show congratulatory message without image
            assistantContent = `Wonderful! That's exactly right! 🎉`;
            
            const congratulatoryMessage: Message = {
              role: 'assistant',
              content: assistantContent
            };

            setMessages(prev => [...prev, congratulatoryMessage]);

            // Generate and play TTS for congratulatory message
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

              // Generate and play TTS for next question
              try {
                const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
                  body: { 
                    text: nextQuestionContent,
                    voice: 'nova'
                  }
                });

                if (!ttsError && ttsData.audioContent) {
                  await playAudio(ttsData.audioContent);
                  // Re-enable auto-recording after next question
                  setAutoRecordingEnabled(true);
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
      } else {
        systemPrompt = `You are Laura, a gentle speech therapist. Continue the conversation naturally, providing encouragement and speech therapy guidance.`;

        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: {
            messages: [...messages, userMessage],
            model: 'gpt-4o-mini',
            systemPrompt
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
      if (useStructuredMode && currentQuestions.length > 0) {
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
          
          // Re-enable auto-recording after response (except for final message)
          if (useStructuredMode && currentQuestions.length > 0) {
            const isLastQuestion = currentQuestionIndex >= currentQuestions.length - 1;
            const isCorrectAnswer = messageText.toLowerCase().includes(currentQuestions[currentQuestionIndex].answer.toLowerCase());
            
            // Only enable auto-recording if not the final correct answer
            if (!(isLastQuestion && isCorrectAnswer)) {
              setAutoRecordingEnabled(true);
            } else {
              // Disable auto-recording for final message
              setAutoRecordingEnabled(false);
            }
          } else {
            // For free chat mode, always re-enable auto-recording
            setAutoRecordingEnabled(true);
          }
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
        setAutoRecordingEnabled(false); // Disable auto-recording while processing
        const audioData = await stopRecording();
        
        // Convert speech to text
        const { data, error } = await supabase.functions.invoke('openai-stt', {
          body: { audio: audioData }
        });

        if (error) throw error;
        
        if (data.text) {
          await sendMessage(data.text);
        }
      } catch (error) {
        console.error('Error processing voice:', error);
        toast({
          title: "Error",
          description: "Failed to process voice recording. Please try again.",
          variant: "destructive",
        });
        // Re-enable auto-recording on error
        setAutoRecordingEnabled(true);
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        await startRecording();
        setAutoRecordingEnabled(false); // Manual recording disables auto mode temporarily
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
      setInput('');
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-blue-600 text-white p-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage 
                src="/lovable-uploads/Laura.png" 
                alt="Laura - Speech Therapist" 
              />
              <AvatarFallback className="bg-blue-500 text-white text-lg">L</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">Laura</h2>
              <p className="text-blue-100 text-sm font-normal">
                Your AI Speech Therapy Assistant
              </p>
              {useStructuredMode && (
                <p className="text-blue-200 text-xs">
                  Q&A Mode: {currentQuestionIndex + 1}/{currentQuestions.length}
                </p>
              )}
              {autoRecordingEnabled && (
                <p className="text-green-200 text-xs">
                  🎤 Auto-recording enabled
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
                className="border-white text-white hover:bg-white hover:text-blue-600"
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
              className={`border-white text-white hover:bg-white hover:text-blue-600 ${
                isPlaying ? "bg-white text-blue-600" : ""
              }`}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-blue-200 text-gray-800 shadow-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src="/lovable-uploads/Laura.png" 
                        alt="Laura" 
                      />
                      <AvatarFallback className="bg-blue-500 text-white text-lg">L</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-blue-600">Laura:</span>
                  </div>
                )}
                {message.imageUrl && (
                  <div className="mb-3">
                    <img 
                      src={message.imageUrl} 
                      alt="Question image" 
                      className="max-w-full h-32 object-contain rounded border"
                      onLoad={() => console.log('Image loaded successfully:', message.imageUrl)}
                      onError={(e) => console.error('Image failed to load:', message.imageUrl, e)}
                    />
                  </div>
                )}
                <div className="leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src="/lovable-uploads/Laura.png" 
                      alt="Laura" 
                    />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">L</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-blue-600">Laura:</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice recording..."
            disabled={loading || isProcessing}
            className="border-blue-200 focus:border-blue-500"
          />
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={handleVoiceRecording}
            disabled={loading || isProcessing}
            className={`border-blue-200 ${isRecording ? "animate-pulse" : ""}`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={() => {
              sendMessage(input);
              setInput('');
            }} 
            disabled={loading || !input.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send
          </Button>
        </div>
        {isProcessing && (
          <div className="text-center text-sm text-blue-600">
            Processing voice recording...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAIChat;
