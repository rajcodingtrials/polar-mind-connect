
import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const processedChunksRef = useRef<Float32Array[]>([]);

  // Audio preprocessing settings optimized for children's speech
  const audioSettings = {
    // Noise gate settings
    noiseGateThreshold: 0.01, // Reduce background noise
    noiseGateRatio: 0.1,
    
    // Compressor settings for dynamic range
    compressorThreshold: -24, // dB
    compressorRatio: 4,
    compressorAttack: 0.003, // 3ms
    compressorRelease: 0.25, // 250ms
    
    // Gain settings
    preGain: 2.0, // Boost input signal
    postGain: 1.5, // Final output gain
    
    // EQ settings for speech clarity
    highPassFreq: 100, // Remove low-frequency noise
    speechBoostFreq: 2000, // Boost speech frequencies
    speechBoostGain: 3 // dB boost for speech clarity
  };

  // Noise gate processing
  const applyNoiseGate = (sample: number): number => {
    const absSample = Math.abs(sample);
    if (absSample < audioSettings.noiseGateThreshold) {
      return sample * audioSettings.noiseGateRatio;
    }
    return sample;
  };

  // Simple compressor for dynamic range control
  const applyCompressor = (sample: number): number => {
    const absSample = Math.abs(sample);
    const thresholdLinear = Math.pow(10, audioSettings.compressorThreshold / 20);
    
    if (absSample > thresholdLinear) {
      const excess = absSample - thresholdLinear;
      const compressedExcess = excess / audioSettings.compressorRatio;
      const compressedSample = (thresholdLinear + compressedExcess) * Math.sign(sample);
      return compressedSample;
    }
    return sample;
  };

  // High-pass filter to remove low-frequency noise
  let highPassPrevInput = 0;
  let highPassPrevOutput = 0;
  const applyHighPassFilter = (sample: number): number => {
    const RC = 1.0 / (2 * Math.PI * audioSettings.highPassFreq);
    const dt = 1.0 / 48000; // Sample rate
    const alpha = RC / (RC + dt);
    
    const output = alpha * (highPassPrevOutput + sample - highPassPrevInput);
    highPassPrevInput = sample;
    highPassPrevOutput = output;
    
    return output;
  };

  // Process audio chunk with all enhancements
  const processAudioChunk = (inputData: Float32Array): Float32Array => {
    const processedData = new Float32Array(inputData.length);
    
    for (let i = 0; i < inputData.length; i++) {
      let sample = inputData[i];
      
      // Apply pre-gain to boost weak signals
      sample *= audioSettings.preGain;
      
      // Apply high-pass filter to remove low-frequency noise
      sample = applyHighPassFilter(sample);
      
      // Apply noise gate to reduce background noise
      sample = applyNoiseGate(sample);
      
      // Apply compressor to control dynamic range
      sample = applyCompressor(sample);
      
      // Apply post-gain and ensure we don't clip
      sample *= audioSettings.postGain;
      sample = Math.max(-1, Math.min(1, sample));
      
      processedData[i] = sample;
    }
    
    return processedData;
  };

  const startRecording = useCallback(async () => {
    try {
      // Enhanced audio constraints with preprocessing-friendly settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false, // We'll handle this with our custom processing
          autoGainControl: false, // We'll handle gain manually
          latency: 0.01 // Low latency for real-time processing
        } 
      });
      
      console.log('Audio stream acquired with preprocessing-friendly settings');
      console.log('Stream settings:', stream.getAudioTracks()[0].getSettings());
      
      // Create audio context for real-time processing
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create script processor for real-time audio processing
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processedChunksRef.current = [];
      
      // Process audio in real-time
      processorRef.current.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const processedData = processAudioChunk(inputData);
        processedChunksRef.current.push(new Float32Array(processedData));
        
        // Also pass processed audio to output for monitoring (optional)
        const outputData = event.outputBuffer.getChannelData(0);
        outputData.set(processedData);
      };
      
      // Connect audio processing chain
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      // Set up MediaRecorder with the processed stream
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 256000 // High bitrate for quality
      };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Enhanced audio chunk recorded:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('Enhanced recording started with audio preprocessing');
        console.log('Preprocessing settings:', audioSettings);
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      mediaRecorderRef.current.start(500); // 500ms chunks
      setIsRecording(true);
      
      // Extended recording time for processed audio
      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          console.log('Auto-stopping enhanced recording after 20 seconds');
          stopRecording();
        }
      }, 20000); // Extended to 20 seconds for better speech capture
      
      console.log('Enhanced audio recording started with preprocessing pipeline');
    } catch (error) {
      console.error('Error starting enhanced recording:', error);
      throw error;
    }
  }, [isRecording]);

  // Enhanced helper function to convert processed audio
  const combineProcessedAudio = (): Float32Array => {
    if (processedChunksRef.current.length === 0) {
      return new Float32Array(0);
    }
    
    const totalLength = processedChunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedAudio = new Float32Array(totalLength);
    
    let offset = 0;
    for (const chunk of processedChunksRef.current) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }
    
    console.log('Combined processed audio chunks:', processedChunksRef.current.length, 'total samples:', totalLength);
    return combinedAudio;
  };

  // Convert Float32 processed audio to base64
  const processedAudioToBase64 = (processedAudio: Float32Array): string => {
    // Convert to 16-bit PCM at 24kHz (Whisper's preferred format)
    const targetSampleRate = 24000;
    const sourceSampleRate = 48000;
    const ratio = sourceSampleRate / targetSampleRate;
    
    // Downsample to 24kHz
    const downsampledLength = Math.floor(processedAudio.length / ratio);
    const downsampled = new Float32Array(downsampledLength);
    
    for (let i = 0; i < downsampledLength; i++) {
      const sourceIndex = Math.floor(i * ratio);
      downsampled[i] = processedAudio[sourceIndex];
    }
    
    // Convert to 16-bit PCM
    const int16Array = new Int16Array(downsampled.length);
    for (let i = 0; i < downsampled.length; i++) {
      const s = Math.max(-1, Math.min(1, downsampled[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to base64 in chunks to avoid memory issues
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    console.log('Processed audio converted to base64, size:', binary.length);
    return btoa(binary);
  };

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      // Clear timeouts
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
          console.log('Processing enhanced audio with', processedChunksRef.current.length, 'processed chunks');
          
          // Use the processed audio data instead of the raw MediaRecorder chunks
          const processedAudio = combineProcessedAudio();
          
          if (processedAudio.length === 0) {
            console.warn('No processed audio data available');
            reject(new Error('No audio data recorded'));
            return;
          }
          
          console.log('Enhanced audio processing completed:', {
            processedSamples: processedAudio.length,
            duration: processedAudio.length / 48000,
            enhancementsApplied: ['noise_gate', 'compressor', 'high_pass', 'gain_boost']
          });
          
          // Convert processed audio to base64
          const base64Audio = processedAudioToBase64(processedAudio);
          
          console.log('Enhanced audio ready for Whisper, base64 length:', base64Audio.length);
          
          // Clean up audio processing resources
          if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
          }
          
          if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
          }
          
          if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
          }
          
          // Stop all tracks
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
          console.error('Error processing enhanced audio:', error);
          reject(error);
        }
      };

      console.log('Stopping enhanced audio recording with preprocessing...');
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
