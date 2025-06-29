
import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone access...');
      
      // Request microphone with better constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Lower sample rate for better compatibility
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      console.log('Audio stream acquired successfully');
      console.log('Stream settings:', stream.getAudioTracks()[0].getSettings());
      
      // Reset chunks
      chunksRef.current = [];
      
      // Try to use WAV format first, fallback to WebM
      let options: MediaRecorderOptions = {};
      
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options.mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else {
        console.warn('No ideal audio format supported, using default');
      }
      
      console.log('Using MediaRecorder options:', options);
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Audio chunk recorded:', event.data.size, 'bytes, type:', event.data.type);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('Recording started successfully');
        setIsRecording(true);
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped');
        setIsRecording(false);
      };
      
      // Start recording with smaller chunks for better processing
      mediaRecorderRef.current.start(500); // 500ms chunks
      
      // Auto-stop after 10 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('Auto-stopping recording after 10 seconds');
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

      // Clear timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log('Processing audio with', chunksRef.current.length, 'chunks');
          
          if (chunksRef.current.length === 0) {
            console.warn('No audio chunks recorded');
            reject(new Error('No audio data recorded'));
            return;
          }
          
          // Create blob from recorded chunks
          const mimeType = chunksRef.current[0]?.type || 'audio/webm';
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          console.log('Created audio blob:', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          if (audioBlob.size === 0) {
            reject(new Error('Empty audio recording'));
            return;
          }
          
          // Convert blob to base64 more efficiently
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const base64String = reader.result as string;
              // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
              const base64Audio = base64String.split(',')[1];
              
              console.log('Audio converted to base64, length:', base64Audio.length);
              
              // Stop all tracks
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                  track.stop();
                  console.log('Stopped audio track:', track.label);
                });
                streamRef.current = null;
              }
              
              resolve(base64Audio);
            } catch (error) {
              console.error('Error converting to base64:', error);
              reject(error);
            }
          };
          
          reader.onerror = () => {
            console.error('FileReader error');
            reject(new Error('Failed to read audio file'));
          };
          
          reader.readAsDataURL(audioBlob);
          
        } catch (error) {
          console.error('Error processing audio:', error);
          reject(error);
        }
      };

      console.log('Stopping audio recording...');
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
