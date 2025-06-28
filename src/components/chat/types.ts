
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: string;
}

export interface OpenAIChatProps {
  onClose?: () => void;
  questions?: Question[];
  imageUrls?: {[key: string]: string};
  useStructuredMode?: boolean;
  onToggleMode?: () => void;
  selectedQuestionType?: string;
  onCorrectAnswer?: () => void;
}
