import { supabase } from '@/integrations/supabase/client';

export type MessageType = 'tts_audio' | 'question_feedback' | 'celebration_visual';
export type MessageCategory = 'correct_answer' | 'retry_encouragement' | 'session_complete' | 'milestone' | 'streak';

interface CelebrationMessageParams {
  messageType: MessageType;
  therapistName: string;
  messageCategory: MessageCategory;
  progressLevel: number;
  childName?: string;
}

/**
 * Get a personalized celebration message from the database
 */
export const getCelebrationMessage = async ({
  messageType,
  therapistName,
  messageCategory,
  progressLevel,
  childName
}: CelebrationMessageParams): Promise<string> => {
  try {
    // Get random message from database
    const { data, error } = await supabase
      .from('celebration_messages')
      .select('content')
      .eq('message_type', messageType)
      .eq('therapist_name', therapistName)
      .eq('message_category', messageCategory)
      .eq('progress_level', progressLevel)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching celebration message:', error);
      return getFallbackMessage(messageType, therapistName, progressLevel, childName);
    }

    if (!data || data.length === 0) {
      console.warn('No celebration message found, using fallback');
      return getFallbackMessage(messageType, therapistName, progressLevel, childName);
    }

    let message = data[0].content;

    // Replace placeholders with actual values
    if (childName) {
      message = message.replace(/{child_name}/g, childName);
    }

    return message;
  } catch (error) {
    console.error('Error in getCelebrationMessage:', error);
    return getFallbackMessage(messageType, therapistName, progressLevel, childName);
  }
};

/**
 * Get multiple celebration messages for variety
 */
export const getCelebrationMessages = async ({
  messageType,
  therapistName,
  messageCategory,
  progressLevel,
  childName
}: CelebrationMessageParams): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('celebration_messages')
      .select('content')
      .eq('message_type', messageType)
      .eq('therapist_name', therapistName)
      .eq('message_category', messageCategory)
      .eq('progress_level', progressLevel)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching celebration messages:', error);
      return [getFallbackMessage(messageType, therapistName, progressLevel, childName)];
    }

    if (!data || data.length === 0) {
      return [getFallbackMessage(messageType, therapistName, progressLevel, childName)];
    }

    return data.map(item => {
      let message = item.content;
      if (childName) {
        message = message.replace(/{child_name}/g, childName);
      }
      return message;
    });
  } catch (error) {
    console.error('Error in getCelebrationMessages:', error);
    return [getFallbackMessage(messageType, therapistName, progressLevel, childName)];
  }
};

/**
 * Get a random celebration message from available options
 */
export const getRandomCelebrationMessage = async (params: CelebrationMessageParams): Promise<string> => {
  const messages = await getCelebrationMessages(params);
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Fallback messages when database is unavailable
 */
const getFallbackMessage = (
  messageType: MessageType,
  therapistName: string,
  progressLevel: number,
  childName?: string
): string => {
  const baseMessage = getBaseFallbackMessage(messageType, therapistName, progressLevel);
  
  if (childName) {
    return baseMessage.replace(/{child_name}/g, childName);
  }
  
  return baseMessage;
};

const getBaseFallbackMessage = (
  messageType: MessageType,
  therapistName: string,
  progressLevel: number
): string => {
  const isLaura = therapistName.toLowerCase() === 'laura';
  
  switch (messageType) {
    case 'tts_audio':
      return getTTSFallback(isLaura, progressLevel);
    case 'question_feedback':
      return getFeedbackFallback(isLaura, progressLevel);
    case 'celebration_visual':
      return getVisualFallback(isLaura, progressLevel);
    default:
      return 'Great job!';
  }
};

const getTTSFallback = (isLaura: boolean, progressLevel: number): string => {
  if (isLaura) {
    const lauraMessages = [
      'Good job! You got it right!',
      'Great work! You\'re doing well!',
      'Amazing! You\'re on fire!',
      'Wonderful! You\'re incredible!',
      'Outstanding! You\'ve completed everything!'
    ];
    return lauraMessages[Math.min(progressLevel - 1, lauraMessages.length - 1)];
  } else {
    const lawrenceMessages = [
      'Excellent! That\'s the right answer!',
      'Great progress! You\'re improving!',
      'Impressive! You\'re mastering this!',
      'Remarkable! You\'re becoming an expert!',
      'Superb! You\'ve completed the session!'
    ];
    return lawrenceMessages[Math.min(progressLevel - 1, lawrenceMessages.length - 1)];
  }
};

const getFeedbackFallback = (isLaura: boolean, progressLevel: number): string => {
  if (isLaura) {
    const lauraMessages = [
      'Good job, {child_name}! That\'s correct! 🎉',
      'Great work, {child_name}! You\'re learning fast! ⭐',
      'Amazing, {child_name}! You\'re on a roll! 🔥',
      'Wonderful, {child_name}! You\'re incredible! 💫',
      'Outstanding, {child_name}! You\'ve mastered this session! 👑'
    ];
    return lauraMessages[Math.min(progressLevel - 1, lauraMessages.length - 1)];
  } else {
    const lawrenceMessages = [
      'Excellent, {child_name}! That\'s the right answer! 🎯',
      'Great progress, {child_name}! You\'re improving! 📈',
      'Impressive, {child_name}! You\'re mastering this! 🎓',
      'Remarkable, {child_name}! You\'re becoming an expert! 🏆',
      'Superb, {child_name}! You\'ve completed the session! 🎊'
    ];
    return lawrenceMessages[Math.min(progressLevel - 1, lawrenceMessages.length - 1)];
  }
};

const getVisualFallback = (isLaura: boolean, progressLevel: number): string => {
  if (isLaura) {
    const lauraMessages = [
      '🎉 Good Job! 🎉',
      '🌟 Great Work! 🌟',
      '🔥 Amazing! 🔥',
      '💫 Wonderful! 💫',
      '👑 Outstanding! 👑'
    ];
    return lauraMessages[Math.min(progressLevel - 1, lauraMessages.length - 1)];
  } else {
    const lawrenceMessages = [
      '🎯 Excellent! 🎯',
      '📈 Great Progress! 📈',
      '🎓 Impressive! 🎓',
      '🏆 Remarkable! 🏆',
      '🎊 Superb! 🎊'
    ];
    return lawrenceMessages[Math.min(progressLevel - 1, lawrenceMessages.length - 1)];
  }
};

/**
 * Calculate progress level based on correct answers
 */
export const calculateProgressLevel = (correctAnswers: number): number => {
  if (correctAnswers <= 1) return 1;
  if (correctAnswers <= 2) return 2;
  if (correctAnswers <= 3) return 3;
  if (correctAnswers <= 4) return 4;
  return 5; // 5 or more correct answers
}; 