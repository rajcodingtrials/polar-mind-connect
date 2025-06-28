
import { Question } from './types';

export const selectRandomQuestions = (questions: Question[]) => {
  if (questions.length === 0) return [];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(5, questions.length));
};

export const createConversationalLessonPlan = () => {
  const topics = [
    'pets and animals',
    'favorite foods',
    'family and friends',
    'toys and games',
    'colors and shapes',
    'school and learning'
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  return { topic: randomTopic };
};

export const isQuestionMessage = (content: string): boolean => {
  return content.includes('?') || 
         content.toLowerCase().includes('what') ||
         content.toLowerCase().includes('how') ||
         content.toLowerCase().includes('where') ||
         content.toLowerCase().includes('when') ||
         content.toLowerCase().includes('why') ||
         content.toLowerCase().includes('can you') ||
         content.toLowerCase().includes('tell me');
};

export const addPausesAfterQuestions = (text: string): string => {
  return text.replace(/\?/g, '?... ');
};
