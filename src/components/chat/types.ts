
export interface Message {
  id: string;
  role: 'user' | 'assistant';  
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: string;
}

export interface ChatMessageProps {
  message: Message;
  ttsSettings: {
    voice: string;
    speed: number;
    enableSSML: boolean;
  };
}

export interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}
