import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, X, RotateCcw, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VoiceRecorder from './chat/VoiceRecorder';
import ChatMessage from './chat/ChatMessage';
import { calculateSimilarity } from './chat/fuzzyMatching';
import type { Message, Question } from './chat/types';
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
  console.log('OpenAIChat received questions:', questions.length);
  console.log('Questions:', questions);
  console.log('Available image URLs:', Object.keys(imageUrls));
  console.log('Selected question type:', selectedQuestionType);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [ttsSettings, setTtsSettings] = useState({ voice: 'nova', speed: 1, enableSSML: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const sendInitialMessage = async () => {
    setIsLoading(true);
    
    try {
      console.log('=== SENDING INITIAL MESSAGE ===');
      console.log('Activity type:', selectedQuestionType);
      console.log('Structured mode:', useStructuredMode);
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [],
          activityType: selectedQuestionType,
          customInstructions: useStructuredMode ? 
            `You have ${questions.length} questions available for the ${selectedQuestionType} activity.` : 
            undefined
        }
      });

      console.log('=== EDGE FUNCTION RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Error calling OpenAI chat function:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to Laura. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.choices?.[0]?.message?.content) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date()
        };

        setMessages([aiMessage]);
        
        if (useStructuredMode && questions.length > 0) {
          setIsWaitingForAnswer(true);
        }
      }
    } catch (error) {
      console.error('Error in sendInitialMessage:', error);
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
      console.log('=== SENDING MESSAGE TO EDGE FUNCTION ===');
      console.log('Messages to send:', updatedMessages.map(m => ({ role: m.role, content: m.content })));
      console.log('Activity type:', selectedQuestionType);
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          activityType: selectedQuestionType
        }
      });

      console.log('=== EDGE FUNCTION RESPONSE ===');
      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Error calling OpenAI chat function:', error);
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
        
        if (useStructuredMode && isWaitingForAnswer && questions[currentQuestionIndex]) {
          const currentQuestion = questions[currentQuestionIndex];
          const similarity = calculateSimilarity(messageContent, currentQuestion.answer);
          
          if (similarity > 0.7) {
            onCorrectAnswer();
            setCurrentQuestionIndex(prev => prev + 1);
            setIsWaitingForAnswer(false);
            
            setTimeout(() => {
              if (currentQuestionIndex + 1 < questions.length) {
                setIsWaitingForAnswer(true);
              }
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  return (
    <Card className="w-full h-[600px] flex flex-col bg-white border-gray-200 shadow-lg">
      <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Chat with Laura 💫
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {selectedQuestionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge 
                  variant={useStructuredMode ? "default" : "outline"} 
                  className="text-xs cursor-pointer hover:bg-gray-100"
                  onClick={onToggleMode}
                >
                  {useStructuredMode ? "Structured" : "Free Chat"}
                </Badge>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {currentQuestion && useStructuredMode && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 shrink-0">
            <div className="flex items-center space-x-3">
              {currentQuestion.imageName && imageUrls[currentQuestion.imageName] && (
                <img 
                  src={imageUrls[currentQuestion.imageName]} 
                  alt="Question" 
                  className="w-16 h-16 object-cover rounded-lg border-2 border-amber-300"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <p className="text-amber-700">{currentQuestion.question}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              ttsSettings={ttsSettings}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4 shrink-0">
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
                disabled={isLoading}
                className="pr-12"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => sendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <VoiceRecorder
              onTranscription={(text) => {
                setInputValue(text);
                sendMessage(text);
              }}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenAIChat;
