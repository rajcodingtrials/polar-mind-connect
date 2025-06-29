
import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Simplified audio constraints - let MediaRecorder handle the format
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100, // Standard sample rate
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Audio stream acquired successfully');
      console.log('Stream settings:', stream.getAudioTracks()[0].getSettings());
      
      // Use MediaRecorder with supported format
      let options: MediaRecorderOptions = {};
      
      // Try different MIME types in order of preference
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
        options.audioBitsPerSecond = 128000;
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
        options.audioBitsPerSecond = 128000;
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
        options.audioBitsPerSecond = 128000;
      } else {
        console.warn('No supported audio format found, using default');
      }
      
      console.log('Using MediaRecorder options:', options);
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Audio chunk recorded:', event.data.size, 'bytes, type:', event.data.type);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('Recording started successfully');
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      mediaRecorderRef.current.start(1000); // 1 second chunks
      setIsRecording(true);
      
      // Auto-stop after 10 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          console.log('Auto-stopping recording after 10 seconds');
          stopRecording();
        }
      }, 10000);
      
      console.log('Audio recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [isRecording]);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
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
          const audioBlob = new Blob(chunksRef.current, { 
            type: chunksRef.current[0]?.type || 'audio/webm'
          });
          
          console.log('Created audio blob:', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          // Convert blob to base64
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert to base64 in chunks to avoid memory issues
          let binary = '';
          const chunkSize = 0x8000;
          
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          
          const base64Audio = btoa(binary);
          
          console.log('Audio converted to base64, length:', base64Audio.length);
          
          // Stop all tracks
          const stream = mediaRecorderRef.current?.stream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log('Stopped audio track:', track.label);
            });
          }
          
          setIsRecording(false);
          resolve(base64Audio);
        } catch (error) {
          console.error('Error processing audio:', error);
          reject(error);
        }
      };

      console.log('Stopping audio recording...');
      mediaRecorderRef.current.stop();
    });
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    setIsProcessing,
    startRecording,
    stopRecording,
  };
};
