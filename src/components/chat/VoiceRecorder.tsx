
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useToast } from '@/components/ui/use-toast';

interface VoiceRecorderProps {
  onResult: (audioBlob: Blob) => Promise<void>;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  disabled?: boolean;
}

const VoiceRecorder = ({ onResult, isListening, onListeningChange, disabled }: VoiceRecorderProps) => {
  const { toast } = useToast();
  const { startRecording, stopRecording } = useAudioRecorder();

  const handleVoiceRecording = async () => {
    if (isListening) {
      try {
        onListeningChange(false);
        const base64Audio = await stopRecording();
        
        // Convert base64 to blob
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/webm' });
        
        await onResult(audioBlob);
      } catch (error) {
        console.error('Error processing voice recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to process voice recording. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      try {
        await startRecording();
        onListeningChange(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Microphone Error",
          description: "Failed to access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      onClick={handleVoiceRecording}
      disabled={disabled}
      className={`w-16 h-16 rounded-full border-2 shadow-lg transition-all duration-300 flex items-center justify-center ${
        isListening 
          ? 'bg-red-300 border-red-200 text-white transform scale-105' 
          : 'bg-slate-200 hover:bg-slate-300 border-slate-100 text-slate-600 hover:scale-105'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
    </Button>
  );
};

export default VoiceRecorder;
