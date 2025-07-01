
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }
    };
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    try {
      setIsPlaying(true);
      
      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }
      
      currentUrlRef.current = audioUrl;
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
          currentUrlRef.current = null;
        }
      };
      
      audioRef.current.onerror = () => {
        console.error('Audio playback error');
        setIsPlaying(false);
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
          currentUrlRef.current = null;
        }
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    }
  }, []);

  const stopAudio = useCallback(() => {
    console.log('Stopping audio...');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    playAudio,
    stopAudio,
  };
};
