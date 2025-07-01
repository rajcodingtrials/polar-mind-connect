import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopPromiseRef = useRef<{ resolve: (value: string) => void; reject: (error: Error) => void } | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone access...');
      
      // Request microphone with better constraints
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
        if (stopPromiseRef.current) {
          stopPromiseRef.current.reject(new Error('MediaRecorder error'));
          stopPromiseRef.current = null;
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        setIsRecording(false);
        
        if (stopPromiseRef.current) {
          try {
            console.log('Processing audio with', chunksRef.current.length, 'chunks');
            
            if (chunksRef.current.length === 0) {
              console.warn('No audio chunks recorded');
              stopPromiseRef.current.reject(new Error('No audio data recorded'));
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
              stopPromiseRef.current.reject(new Error('Empty audio recording'));
              return;
            }

            // --- Audio Quality Analysis ---
            async function analyzeAudioQuality(audioBlob: Blob): Promise<{ isSilent: boolean; isClipped: boolean }> {
              return new Promise((resolve) => {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const reader = new FileReader();
                reader.onload = async () => {
                  const arrayBuffer = reader.result as ArrayBuffer;
                  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                  let max = 0;
                  let sum = 0;
                  let count = 0;

                  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                    const data = audioBuffer.getChannelData(i);
                    for (let j = 0; j < data.length; j++) {
                      const abs = Math.abs(data[j]);
                      max = Math.max(max, abs);
                      sum += abs;
                      count++;
                    }
                  }

                  const avg = sum / count;
                  const isSilent = avg < 0.005; // More lenient silence threshold
                  const isClipped = max > 0.99; // Only consider clipped if very close to 1.0

                  resolve({ isSilent, isClipped });
                };
                reader.readAsArrayBuffer(audioBlob);
              });
            }

            const quality = await analyzeAudioQuality(audioBlob);
            console.log('Audio quality analysis:', {
              isSilent: quality.isSilent,
              isClipped: quality.isClipped,
              blobSize: audioBlob.size
            });
            
            // Only reject if the audio is completely silent
            if (quality.isSilent) {
              console.warn('Audio too quiet, but continuing anyway');
              // Don't reject, just continue with the recording
            }
            
            // Only reject if the audio is severely clipped (very rare)
            if (quality.isClipped) {
              console.warn('Audio may be clipped, but continuing anyway');
              // Don't reject, just continue with the recording
            }
            // --- End Audio Quality Analysis ---
            
            // Convert blob to base64
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const base64String = reader.result as string;
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
                
                if (stopPromiseRef.current) {
                  stopPromiseRef.current.resolve(base64Audio);
                  stopPromiseRef.current = null;
                }
              } catch (error) {
                console.error('Error converting to base64:', error);
                if (stopPromiseRef.current) {
                  stopPromiseRef.current.reject(error as Error);
                  stopPromiseRef.current = null;
                }
              }
            };
            
            reader.onerror = () => {
              console.error('FileReader error');
              if (stopPromiseRef.current) {
                stopPromiseRef.current.reject(new Error('Failed to read audio file'));
                stopPromiseRef.current = null;
              }
            };
            
            reader.readAsDataURL(audioBlob);
            
          } catch (error) {
            console.error('Error processing audio:', error);
            if (stopPromiseRef.current) {
              stopPromiseRef.current.reject(error as Error);
              stopPromiseRef.current = null;
            }
          }
        }
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
        console.log('Not recording, current state:', mediaRecorderRef.current?.state);
        reject(new Error('Not recording'));
        return;
      }

      console.log('Stop recording requested, current state:', mediaRecorderRef.current.state);

      // Clear timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      // Store the promise handlers so the onstop handler can use them
      stopPromiseRef.current = { resolve, reject };

      // Stop the recording - the onstop handler will process the result
      console.log('Calling MediaRecorder.stop()...');
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
