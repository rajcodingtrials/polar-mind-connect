import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { VoiceRecorderProps } from './types';

const VoiceRecorder = ({ onTranscription, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start mic test or volume meter
  const startMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      source.connect(analyserRef.current);
      drawMeter();
    } catch (e) {
      setVolume(0);
    }
  };

  // Stop mic test or volume meter
  const stopMeter = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setVolume(0);
  };

  // Draw volume meter
  const drawMeter = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = (dataArrayRef.current[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    setVolume(rms);
    animationRef.current = requestAnimationFrame(drawMeter);
  };

  // Handle recording/test state changes
  useEffect(() => {
    if (isRecording || isTesting) {
      startMeter();
    } else {
      stopMeter();
    }
    return stopMeter;
    // eslint-disable-next-line
  }, [isRecording, isTesting]);

  // Handle test mic button
  const handleTestMic = () => {
    setIsTesting((prev) => !prev);
  };

  // Handle record button
  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTesting(false);
      setTimeout(() => {
        onTranscription("This is a test transcription");
      }, 1000);
    } else {
      setIsRecording(true);
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={isRecording ? "destructive" : "outline"}
          onClick={handleVoiceRecording}
          className="shrink-0"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant={isTesting ? "secondary" : "outline"}
          onClick={handleTestMic}
          className="shrink-0"
        >
          {isTesting ? "Stop Test" : "Test Mic"}
        </Button>
      </div>
      <div className="w-32 h-3 bg-gray-200 rounded overflow-hidden mt-1">
        <div
          className="h-full bg-green-500 transition-all duration-100"
          style={{ width: `${Math.min(100, Math.round(volume * 100))}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">{volume > 0.2 ? "Good!" : volume > 0.05 ? "Too quiet" : ""}</div>
    </div>
  );
};

export default VoiceRecorder;
