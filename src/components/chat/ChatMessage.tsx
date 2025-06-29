
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessageProps } from './types';

const ChatMessage = ({ message, ttsSettings }: ChatMessageProps) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { isPlaying, playAudio } = useAudioPlayer();

  const handlePlayTTS = async () => {
    if (isPlaying) return;
    
    setIsGeneratingAudio(true);
    try {
      console.log('Generating TTS for message:', message.content.substring(0, 50) + '...');
      console.log('Using TTS settings:', ttsSettings);
      
      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text: message.content,
          voice: ttsSettings.voice,
          speed: ttsSettings.speed
        }
      });

      if (error) {
        console.error('TTS Error:', error);
        return;
      }

      if (data?.audioContent) {
        console.log('Playing TTS audio...');
        await playAudio(data.audioContent);
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="w-full">
      {message.role === 'assistant' && (
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-blue-200">
            <AvatarImage 
              src="/lovable-uploads/Laura.png" 
              alt="Laura" 
            />
            <AvatarFallback className="bg-blue-200 text-blue-800 text-sm font-semibold">L</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-700">Laura:</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayTTS}
              disabled={isGeneratingAudio || isPlaying}
              className="h-6 w-6 p-0 hover:bg-blue-100"
            >
              {isGeneratingAudio ? (
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="h-3 w-3 text-blue-600" />
              ) : (
                <Volume2 className="h-3 w-3 text-blue-600" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className={`w-full ${message.role === 'user' ? 'flex justify-end' : ''}`}>
        <div
          className={`max-w-full p-4 rounded-2xl shadow-sm ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 text-blue-900 ml-12'
              : 'bg-gradient-to-br from-blue-50 to-white border border-blue-100 text-blue-900'
          }`}
        >
          {message.imageUrl && (
            <div className="mb-4 flex justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 shadow-inner">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-xl blur-sm"></div>
                <img 
                  src={message.imageUrl} 
                  alt="Question image" 
                  className="relative max-w-full max-h-[400px] object-contain rounded-xl shadow-lg border-2 border-white"
                  onLoad={() => console.log('Image loaded successfully:', message.imageUrl)}
                  onError={(e) => console.error('Image failed to load:', message.imageUrl, e)}
                />
              </div>
            </div>
          )}
          <div className="leading-relaxed whitespace-pre-wrap text-base">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
