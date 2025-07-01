
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopPromiseRef = useRef<{ resolve: (value: string) => void; reject: (error: Error) => void } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      console.log('Audio stream acquired successfully');
      
      chunksRef.current = [];
      
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        if (stopPromiseRef.current) {
          stopPromiseRef.current.reject(new Error('MediaRecorder error'));
          stopPromiseRef.current = null;
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        
        if (stopPromiseRef.current) {
          try {
            if (chunksRef.current.length === 0) {
              stopPromiseRef.current.reject(new Error('No audio data recorded'));
              return;
            }
            
            const mimeType = chunksRef.current[0]?.type || 'audio/webm';
            const audioBlob = new Blob(chunksRef.current, { type: mimeType });
            
            if (audioBlob.size === 0) {
              stopPromiseRef.current.reject(new Error('Empty audio recording'));
              return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const base64String = reader.result as string;
                const base64Audio = base64String.split(',')[1];
                
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                  streamRef.current = null;
                }
                
                if (stopPromiseRef.current) {
                  stopPromiseRef.current.resolve(base64Audio);
                  stopPromiseRef.current = null;
                }
              } catch (error) {
                if (stopPromiseRef.current) {
                  stopPromiseRef.current.reject(error as Error);
                  stopPromiseRef.current = null;
                }
              }
            };
            
            reader.onerror = () => {
              if (stopPromiseRef.current) {
                stopPromiseRef.current.reject(new Error('Failed to read audio file'));
                stopPromiseRef.current = null;
              }
            };
            
            reader.readAsDataURL(audioBlob);
            
          } catch (error) {
            if (stopPromiseRef.current) {
              stopPromiseRef.current.reject(error as Error);
              stopPromiseRef.current = null;
            }
          }
        }
      };
      
      mediaRecorderRef.current.start(500);
      
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        reject(new Error('Not recording'));
        return;
      }

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      stopPromiseRef.current = { resolve, reject };
      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    isRecording,
    isProcessing,
    setIsProcessing,
    startRecording,
    stopRecording,
  };
};
