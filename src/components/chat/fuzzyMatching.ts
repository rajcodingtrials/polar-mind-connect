
import Fuse from 'fuse.js';
import { generateSpeechDelayVariants, calculatePhoneticSimilarity } from './phoneticMatching';

export interface MatchingOptions {
  speechDelayMode?: boolean;
  threshold?: number;
}

export const calculateSimilarity = (
  userAnswer: string, 
  correctAnswer: string, 
  options: MatchingOptions = {}
): number => {
  if (!userAnswer || !correctAnswer) return 0;
  
  const { speechDelayMode = false, threshold = 0.6 } = options;
  
  // Normalize both strings
  const normalizeString = (str: string) => 
    str.toLowerCase()
       .replace(/[^\w\s]/g, '') // Remove punctuation
       .trim();
  
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);
  
  // Exact match
  if (normalizedUser === normalizedCorrect) return 1;
  
  // In speech delay mode, use more forgiving matching
  if (speechDelayMode) {
    // Check phonetic similarity first
    const phoneticSimilarity = calculatePhoneticSimilarity(normalizedUser, normalizedCorrect);
    if (phoneticSimilarity > 0) {
      return phoneticSimilarity;
    }
    
    // Generate speech delay variants and check for matches
    const variants = generateSpeechDelayVariants(normalizedCorrect);
    for (const variant of variants) {
      if (normalizedUser === variant) {
        return 0.9; // High confidence for known speech delay patterns
      }
      
      // Also check if user's answer contains the variant
      if (normalizedUser.includes(variant) || variant.includes(normalizedUser)) {
        return 0.85;
      }
    }
    
    // Also check reverse - if correct answer variants match user input
    const userVariants = generateSpeechDelayVariants(normalizedUser);
    for (const variant of userVariants) {
      if (variant === normalizedCorrect || normalizedCorrect.includes(variant)) {
        return 0.85;
      }
    }
  }
  
  // Use Fuse.js for fuzzy matching with adjusted threshold
  const fuseThreshold = speechDelayMode ? 0.8 : threshold; // More forgiving in speech delay mode
  const fuse = new Fuse([normalizedCorrect], {
    includeScore: true,
    threshold: fuseThreshold,
    distance: speechDelayMode ? 200 : 100, // Allow more character distance in speech delay mode
  });
  
  const result = fuse.search(normalizedUser);
  
  if (result.length > 0 && result[0].score !== undefined) {
    // Convert Fuse.js score (lower is better) to similarity (higher is better)
    return 1 - result[0].score;
  }
  
  return 0;
};
