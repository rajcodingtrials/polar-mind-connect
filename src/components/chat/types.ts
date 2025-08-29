
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
  imageName?: string; // Keep for backward compatibility with single-image activities
  images?: string[]; // Array of image names for multi-image activities like tap_and_play
  correctImageIndex?: number; // Index of the correct image in the images array (0-based)
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
