
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioRecorder = (amplifyMic: boolean = false, micGain: number = 1.0) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopPromiseRef = useRef<{ resolve: (value: string) => void; reject: (error: Error) => void } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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

      // --- Amplification using GainNode ---
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = amplifyMic ? micGain : 1.0;
      gainNodeRef.current = gainNode;
      // Add analyser node for volume meter
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      // Connect: source -> gain -> analyser -> destination
      source.connect(gainNode);
      gainNode.connect(analyser);
      const destination = audioContext.createMediaStreamDestination();
      analyser.connect(destination);
      // Use destination.stream for MediaRecorder
      const amplifiedStream = destination.stream;

      mediaRecorderRef.current = new MediaRecorder(amplifiedStream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
        // Start volume meter animation
        const updateVolume = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            // Calculate RMS (root mean square) for volume
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const val = (dataArray[i] - 128) / 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / dataArray.length);
            setAudioLevel(rms);
          }
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        if (stopPromiseRef.current) {
          stopPromiseRef.current.reject(new Error('MediaRecorder error'));
          stopPromiseRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        if (stopPromiseRef.current) {
          try {
            if (chunksRef.current.length === 0) {
              stopPromiseRef.current.reject(new Error('No audio data recorded'));
              return;
            }
            
            const mimeType = chunksRef.current[0]?.type || 'audio/webm';
            const audioBlob = new Blob(chunksRef.current, { type: mimeType });
            setLastAudioBlob(audioBlob);
            
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
                if (audioContextRef.current) {
                  audioContextRef.current.close();
                  audioContextRef.current = null;
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
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
    audioLevel,
    lastAudioBlob,
  };
};
