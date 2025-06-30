import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessageProps } from './types';

interface ExtendedChatMessageProps extends ChatMessageProps {
  autoPlayTTS?: boolean;
  onAudioStateChange?: (isGenerating: boolean) => void;
  forceStopAudio?: boolean;
}

const ChatMessage = ({ message, ttsSettings, autoPlayTTS = false, onAudioStateChange, forceStopAudio = false }: ExtendedChatMessageProps) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  // Notify parent component about audio generation state
  useEffect(() => {
    if (onAudioStateChange) {
      onAudioStateChange(isGeneratingAudio);
    }
  }, [isGeneratingAudio, onAudioStateChange]);

  // Stop audio when forceStopAudio is true (when chat closes)
  useEffect(() => {
    if (forceStopAudio) {
      console.log('Force stopping audio in ChatMessage:', message.id);
      stopAudio();
      setIsGeneratingAudio(false);
    }
  }, [forceStopAudio, stopAudio, message.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('ChatMessage unmounting, stopping audio:', message.id);
      stopAudio();
      setIsGeneratingAudio(false);
    };
  }, [stopAudio, message.id]);

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

  // Auto-play TTS for assistant messages when they first appear (only if enabled and not already played)
  useEffect(() => {
    if (message.role === 'assistant' && autoPlayTTS && !hasAutoPlayed && !isPlaying && !isGeneratingAudio) {
      console.log('Auto-playing TTS for assistant message:', message.id);
      // Add a small delay to prevent immediate overlapping
      const timer = setTimeout(() => {
        // Double-check that no audio is playing before starting
        if (!isPlaying && !isGeneratingAudio) {
          setHasAutoPlayed(true);
          handlePlayTTS();
        }
      }, 500); // Small delay to prevent race conditions
      
      return () => clearTimeout(timer);
    }
  }, [message.id, message.role, autoPlayTTS, hasAutoPlayed, isPlaying, isGeneratingAudio]);

  return (
    <div className="w-full">
      <div className={`w-full ${message.role === 'user' ? 'flex justify-end' : ''}`}>
        <div
          className={`max-w-full p-4 rounded-2xl shadow-sm ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 text-blue-900 ml-12'
              : 'bg-gradient-to-br from-blue-50 to-white border border-blue-100 text-blue-900'
          }`}
        >
          <div className="leading-relaxed whitespace-pre-wrap text-base">
            {message.content}
          </div>
          {message.imageUrl && (
            <div className="mt-4 flex justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 shadow-inner">
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
          {message.role === 'assistant' && (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayTTS}
                disabled={isGeneratingAudio}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                {isGeneratingAudio ? (
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
