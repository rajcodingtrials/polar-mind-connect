
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const OpenAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const { toast } = useToast();
  
  const {
    isRecording,
    isProcessing,
    setIsProcessing,
    startRecording,
    stopRecording,
  } = useAudioRecorder();
  
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  // Laura's introduction when component mounts
  useEffect(() => {
    if (!hasIntroduced) {
      const introMessage = "Hello! I'm Laura, your speech therapist. I'm here to help you improve your communication skills and speech clarity. How can I assist you today?";
      setMessages([{ role: 'assistant', content: introMessage }]);
      
      // Play Laura's introduction
      playIntroAudio(introMessage);
      setHasIntroduced(true);
    }
  }, []);

  const playIntroAudio = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { text, voice: 'nova' }
      });

      if (error) throw error;
      if (data.audioContent) {
        await playAudio(data.audioContent);
      }
    } catch (error) {
      console.error('Error playing intro audio:', error);
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

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate and play TTS for Laura's response
      try {
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('openai-tts', {
          body: { 
            text: assistantMessage.content,
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="text-2xl">🗣️ Laura - Speech Therapist</span>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Your AI Speech Therapy Assistant
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAudio}
            disabled={!isPlaying}
            className={isPlaying ? "bg-red-50" : ""}
          >
            {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
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
                    : 'bg-purple-50 border border-purple-200 text-purple-900'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">Laura:</span>
                  </div>
                )}
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-900">Laura:</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          />
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={handleVoiceRecording}
            disabled={loading || isProcessing}
            className={isRecording ? "animate-pulse" : ""}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={() => {
              sendMessage(input);
              setInput('');
            }} 
            disabled={loading || !input.trim() || isProcessing}
          >
            Send
          </Button>
        </div>
        {isProcessing && (
          <div className="text-center text-sm text-muted-foreground">
            Processing voice recording...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAIChat;
