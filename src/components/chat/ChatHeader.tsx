import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, FileQuestion, Volume2, VolumeX, X, RotateCcw } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface ChatHeaderProps {
  useStructuredMode: boolean;
  selectedQuestionType: QuestionType | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  isRecording: boolean;
  isPlaying: boolean;
  hasQuestions: boolean;
  therapistName: string;
  onToggleMode: () => void;
  onToggleAudio: () => void;
  onClose: () => void;
}

const ChatHeader = ({
  useStructuredMode,
  selectedQuestionType,
  currentQuestionIndex,
  totalQuestions,
  isRecording,
  isPlaying,
  hasQuestions,
  therapistName,
  onToggleMode,
  onToggleAudio,
  onClose
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
          <AvatarImage 
            src={`/lovable-uploads/${therapistName}.png`}
            alt={`${therapistName} - Speech Therapist`} 
          />
          <AvatarFallback className="bg-blue-200 text-blue-800 text-lg font-semibold">{therapistName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-blue-900">{therapistName}</h2>
          <p className="text-blue-700 text-sm font-normal">
            Your AI Speech Therapy Assistant
          </p>
          {useStructuredMode && (
            <p className="text-blue-600 text-xs">
              {selectedQuestionType === 'lets_chat' ? 'Conversation Mode' : 'Q&A Mode'}: {currentQuestionIndex + 1}/{totalQuestions}
            </p>
          )}
          {isRecording && (
            <p className="text-rose-600 text-xs font-medium animate-pulse">
              🔴 Recording... Tap the mic again to stop
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasQuestions && onToggleMode && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMode}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
            title={useStructuredMode ? "Switch to Free Chat" : "Switch to Q&A Mode"}
          >
            {useStructuredMode ? <MessageCircle className="w-4 h-4" /> : <FileQuestion className="w-4 h-4" />}
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleAudio}
          disabled={!isPlaying}
          className={`border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm ${
            isPlaying ? "bg-blue-100 border-blue-300" : ""
          }`}
        >
          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        {onClose && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
