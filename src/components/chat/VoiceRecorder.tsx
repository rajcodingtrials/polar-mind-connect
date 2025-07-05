
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { VoiceRecorderProps } from './types';

const VoiceRecorder = ({ onTranscription, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Call onTranscription with empty string to indicate recording stopped
      onTranscription("");
    } else {
      setIsRecording(true);
      // In a real implementation, this would start recording
      // For now, we'll just set the recording state
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
