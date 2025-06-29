
import Fuse from 'fuse.js';

export const calculateSimilarity = (userAnswer: string, correctAnswer: string): number => {
  if (!userAnswer || !correctAnswer) return 0;
  
  // Normalize both strings
  const normalizeString = (str: string) => 
    str.toLowerCase()
       .replace(/[^\w\s]/g, '') // Remove punctuation
       .trim();
  
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);
  
  // Exact match
  if (normalizedUser === normalizedCorrect) return 1;
  
  // Use Fuse.js for fuzzy matching
  const fuse = new Fuse([normalizedCorrect], {
    includeScore: true,
    threshold: 0.6,
    distance: 100,
  });
  
  const result = fuse.search(normalizedUser);
  
  if (result.length > 0 && result[0].score !== undefined) {
    // Convert Fuse.js score (lower is better) to similarity (higher is better)
    return 1 - result[0].score;
  }
  
  return 0;
};
