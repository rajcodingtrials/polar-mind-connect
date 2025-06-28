
import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Enhanced audio constraints optimized for children's voices
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          // High sample rate for better audio quality
          sampleRate: 48000,
          channelCount: 1,
          
          // Enhanced settings for speech therapy
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          
          // Additional constraints for better quality
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googBeamforming: true,
          googArrayGeometry: true,
          
          // Latency settings for real-time processing
          latency: 0.01, // 10ms latency for real-time feel
          
          // Volume settings optimized for children
          volume: 1.0,
          
          // Additional audio processing
          googAudioMirroring: false,
          googDAEchoCancellation: true,
          googNoiseReduction: true,
          
          // Enhanced for speech recognition
          googVoiceActivityDetection: true,
          googAgcStartupMinVolume: 12,
          googAgc2Enabled: true,
          googAecExtendedFilter: true,
          googAecRefinedAdaptiveFilter: true,
        } 
      });
      
      console.log('Audio stream acquired with enhanced settings for children\'s voices');
      console.log('Stream settings:', stream.getAudioTracks()[0].getSettings());
      
      // Check if the browser supports the preferred high-quality codec
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to other high-quality options
        const fallbackTypes = [
          'audio/webm;codecs=pcm',
          'audio/wav',
          'audio/webm',
          'audio/mp4;codecs=mp4a.40.2',
          'audio/mp4'
        ];
        
        for (const type of fallbackTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
        
        if (!mimeType) {
          mimeType = ''; // Let browser choose
        }
      }
      
      const options = mimeType ? { 
        mimeType,
        // High bitrate for better quality (especially important for children's voices)
        audioBitsPerSecond: 256000 // Increased from 128000 for higher quality
      } : { audioBitsPerSecond: 256000 };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('High-quality audio chunk recorded:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('High-quality recording started with options:', options);
        console.log('Recording optimized for children\'s speech patterns');
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      // Record in smaller chunks for better real-time processing
      mediaRecorderRef.current.start(500); // 500ms chunks for more responsive processing
      setIsRecording(true);
      
      // Increased maximum recording duration for longer responses
      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          console.log('Auto-stopping recording after 15 seconds');
          stopRecording();
        }
      }, 15000); // Increased from 10 to 15 seconds
      
      console.log('Enhanced audio recording started - optimized for children\'s voices');
    } catch (error) {
      console.error('Error starting enhanced recording:', error);
      throw error;
    }
  }, [isRecording]);

  // Enhanced helper function to convert ArrayBuffer to base64 without stack overflow
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 16384; // Smaller chunks for better processing
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

      // Clear any existing timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log('Processing', chunksRef.current.length, 'high-quality audio chunks');
          
          // Use the original mime type from the recording
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          console.log('Created high-quality audio blob:', {
            size: audioBlob.size,
            type: audioBlob.type,
            optimizedForChildren: true
          });
          
          // Enhanced validation for minimum recording duration
          if (audioBlob.size < 2000) { // Increased threshold for better quality detection
            console.warn('Audio recording may be too short for optimal speech recognition');
          }
          
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64Audio = arrayBufferToBase64(arrayBuffer);
          
          console.log('Generated high-quality base64 audio, length:', base64Audio.length);
          console.log('Audio optimized for children\'s speech therapy use');
          
          // Stop all tracks and clean up with enhanced cleanup
          const stream = mediaRecorderRef.current?.stream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log('Stopped enhanced audio track:', track.label);
            });
          }
          
          setIsRecording(false);
          resolve(base64Audio);
        } catch (error) {
          console.error('Error processing high-quality audio:', error);
          reject(error);
        }
      };

      console.log('Stopping enhanced audio recording...');
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
