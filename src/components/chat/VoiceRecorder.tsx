
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { VoiceRecorderProps } from './types';

const VoiceRecorder = ({ onTranscription, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // In a real implementation, this would stop recording and process the audio
      // For now, we'll just simulate a transcription
      setTimeout(() => {
        onTranscription("This is a test transcription");
      }, 1000);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <Button
      size="sm"
      variant={isRecording ? "destructive" : "outline"}
      onClick={handleVoiceRecording}
      className="shrink-0"
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceRecorder;
