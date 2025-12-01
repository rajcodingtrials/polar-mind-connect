import { supabase } from '@/integrations/supabase/client';

// Question type is now a string (name from question_types table)
export type QuestionType = string;

// Cache for question types to avoid repeated database calls
let questionTypesCache: Array<{ name: string; display_string: string; description: string }> | null = null;
let cachePromise: Promise<Array<{ name: string; display_string: string; description: string }>> | null = null;

/**
 * Get all valid question types from the database
 * Uses caching to avoid repeated database calls
 */
export const getQuestionTypes = async (): Promise<QuestionType[]> => {
  if (questionTypesCache) {
    return questionTypesCache.map(qt => qt.name);
  }

  if (cachePromise) {
    const cached = await cachePromise;
    return cached.map(qt => qt.name);
  }

  cachePromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('question_types')
        .select('name, display_string, description')
        .order('name');

      if (error) {
        console.error('Error loading question types:', error);
        return [];
      }

      questionTypesCache = data || [];
      return questionTypesCache;
    } catch (err) {
      console.error('Failed to load question types:', err);
      return [];
    }
  })();

  const cached = await cachePromise;
  return cached.map(qt => qt.name);
};

/**
 * Get all question types synchronously (returns cached data or empty array)
 * For use in components that need immediate access without async
 */
export const getQuestionTypesSync = (): QuestionType[] => {
  if (questionTypesCache) {
    return questionTypesCache.map(qt => qt.name);
  }
  return [];
};

/**
 * Get display label for a question type
 * Uses cached data if available, otherwise returns the type name
 */
export const getQuestionTypeLabel = (type: QuestionType | string): string => {
  if (questionTypesCache) {
    const questionType = questionTypesCache.find(qt => qt.name === type);
    if (questionType) {
      return questionType.display_string;
    }
  }
  // Fallback: return formatted version of the type name
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Get description for a question type
 * Uses cached data if available, otherwise returns a default description
 */
export const getQuestionTypeDescription = (type: QuestionType | string): string => {
  if (questionTypesCache) {
    const questionType = questionTypesCache.find(qt => qt.name === type);
    if (questionType) {
      return questionType.description;
    }
  }
  // Fallback: return a default description
  return `Practice ${getQuestionTypeLabel(type).toLowerCase()}`;
};

/**
 * Check if a string is a valid question type
 * Uses cached data if available
 */
export const isValidQuestionType = async (type: string): Promise<boolean> => {
  const validTypes = await getQuestionTypes();
  return validTypes.includes(type);
};

/**
 * Check if a string is a valid question type (synchronous version)
 * Uses cached data if available
 */
export const isValidQuestionTypeSync = (type: string): boolean => {
  const validTypes = getQuestionTypesSync();
  return validTypes.includes(type);
};

/**
 * Initialize question types cache
 * Call this early in the app lifecycle to preload question types
 */
export const initializeQuestionTypesCache = async (): Promise<void> => {
  await getQuestionTypes();
};

/**
 * Clear the question types cache
 * Useful when question types are updated
 */
export const clearQuestionTypesCache = (): void => {
  questionTypesCache = null;
  cachePromise = null;
};

