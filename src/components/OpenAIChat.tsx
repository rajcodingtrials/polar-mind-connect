import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const OpenAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { toast } = useToast();
  
  const {
    isRecording,
    isProcessing,
    setIsProcessing,
    startRecording,
    stopRecording,
  } = useAudioRecorder();
  
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  // Start conversation when component mounts
  useEffect(() => {
    if (!hasStarted) {
      startConversation();
      setHasStarted(true);
    }
  }, []);

  const startConversation = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [],
          model: 'gpt-4o-mini'
        }
      });

      if (error) throw error;

      const assistantContent = data.choices[0].message.content;
      console.log('Assistant response:', assistantContent);

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
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [...messages, userMessage],
          model: 'gpt-4o-mini'
        }
      });

      if (error) throw error;

      const assistantContent = data.choices[0].message.content;
      console.log('Assistant response:', assistantContent);

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent
      };

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
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face" 
                alt="Laura - Speech Therapist" 
              />
              <AvatarFallback className="bg-blue-500 text-white text-lg">L</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">Laura</h2>
              <p className="text-blue-100 text-sm font-normal">
                Your AI Speech Therapy Assistant
              </p>
            </div>
          </div>
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
                        src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face" 
                        alt="Laura" 
                      />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">L</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-blue-600">Laura:</span>
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
                      src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face" 
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
