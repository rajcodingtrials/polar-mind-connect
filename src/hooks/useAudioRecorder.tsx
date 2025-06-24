
import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // Check if the browser supports the preferred codec
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }
      
      const options = mimeType ? { 
        mimeType,
        audioBitsPerSecond: 128000 // Higher bitrate for better quality
      } : { audioBitsPerSecond: 128000 };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Audio chunk recorded:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('Recording started with options:', options);
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      // Record in smaller chunks for better responsiveness
      mediaRecorderRef.current.start(250); // 250ms chunks instead of 100ms
      setIsRecording(true);
      console.log('Audio recording started with enhanced settings');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  // Helper function to convert ArrayBuffer to base64 without stack overflow
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 32768; // Process in 32KB chunks
    let binaryString = '';
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binaryString);
  };

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log('Processing', chunksRef.current.length, 'audio chunks');
          
          // Use the original mime type from the recording
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          console.log('Created audio blob:', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64Audio = arrayBufferToBase64(arrayBuffer);
          
          console.log('Generated base64 audio, length:', base64Audio.length);
          
          // Stop all tracks and clean up
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
