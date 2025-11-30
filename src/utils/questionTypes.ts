import { Constants } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';

type QuestionType = Database['public']['Enums']['question_type_enum'];

/**
 * Get all valid question types from the database enum
 * Uses Constants from the types file (regenerate types after adding new enum values)
 */
export const getQuestionTypes = (): QuestionType[] => {
  return [...Constants.public.Enums.question_type_enum];
};

/**
 * Get display label for a question type
 */
export const getQuestionTypeLabel = (type: QuestionType | string): string => {
  const labels: Record<string, string> = {
    'first_words': 'First Words',
    'starter_words': 'Starter Words',
    'question_time': 'Question Time',
    'build_sentence': 'Build a Sentence',
    'lets_chat': 'Let\'s Chat',
    'tap_and_play': 'Tap and Play',
    'story_activity': 'Story Activity',
  };
  return labels[type] || type;
};

/**
 * Get description for a question type
 */
export const getQuestionTypeDescription = (type: QuestionType | string): string => {
  const descriptions: Record<string, string> = {
    'first_words': 'Practice basic first words and sounds',
    'starter_words': 'Learn your first words like open, more and go',
    'question_time': 'Answer questions about pictures',
    'build_sentence': 'Learn to construct sentences',
    'lets_chat': 'Free conversation practice',
    'story_activity': 'Follow along with interactive story scenes',
    'tap_and_play': 'Choose the correct picture by tapping',
  };
  return descriptions[type] || `Practice ${getQuestionTypeLabel(type).toLowerCase()}`;
};

/**
 * Check if a string is a valid question type
 * Uses Constants from the types file (regenerate types after adding new enum values)
 */
export const isValidQuestionType = (type: string): type is QuestionType => {
  return Constants.public.Enums.question_type_enum.includes(type as QuestionType);
};

