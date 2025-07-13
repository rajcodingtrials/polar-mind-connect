import Fuse from 'fuse.js';
import { generateSpeechDelayVariants, isPhoneticallySimilar, getPhoneticScore } from './phoneticMatching';

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
  
  console.log(`🔍 Fuzzy matching debug:`, {
    originalUser: userAnswer,
    originalCorrect: correctAnswer,
    normalizedUser,
    normalizedCorrect,
    speechDelayMode,
    threshold
  });
  
  // Exact match
  if (normalizedUser === normalizedCorrect) {
    console.log(`✅ Exact match found: ${normalizedUser}`);
    return 1;
  }
  
  // Check if the correct answer is contained within the user's response
  // This handles cases like "the car is blue" containing "blue"
  if (normalizedUser.includes(normalizedCorrect)) {
    console.log(`✅ Correct answer "${normalizedCorrect}" found within user response "${normalizedUser}"`);
    return 0.95; // High confidence for contained matches
  }
  
  // Check if user's response is contained within the correct answer
  if (normalizedCorrect.includes(normalizedUser)) {
    console.log(`✅ User response "${normalizedUser}" found within correct answer "${normalizedCorrect}"`);
    return 0.9; // Good confidence for partial matches
  }
  
  // In speech delay mode, use phonetic and Levenshtein logic
  if (speechDelayMode) {
    // Use new phonetic similarity logic
    if (isPhoneticallySimilar(normalizedUser, normalizedCorrect, 0.7)) {
      const phoneticScore = getPhoneticScore(normalizedUser, normalizedCorrect);
      console.log(`🎵 Phonetic match found: ${phoneticScore}`);
      return phoneticScore;
    }
    // Generate speech delay variants and check for matches (legacy logic)
    const variants = generateSpeechDelayVariants(normalizedCorrect);
    for (const variant of variants) {
      if (normalizedUser === variant) {
        console.log(`🎵 Speech delay variant exact match: ${variant}`);
        return 0.9; // High confidence for known speech delay patterns
      }
      if (normalizedUser.includes(variant) || variant.includes(normalizedUser)) {
        console.log(`🎵 Speech delay variant partial match: ${variant}`);
        return 0.85;
      }
    }
    // Also check reverse - if correct answer variants match user input
    const userVariants = generateSpeechDelayVariants(normalizedUser);
    for (const variant of userVariants) {
      if (variant === normalizedCorrect || normalizedCorrect.includes(variant)) {
        console.log(`🎵 User speech delay variant match: ${variant}`);
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
    const similarity = 1 - result[0].score;
    console.log(`🔍 Fuse.js match found: score=${result[0].score}, similarity=${similarity}`);
    return similarity;
  }
  
  console.log(`❌ No match found for "${normalizedUser}" vs "${normalizedCorrect}"`);
  return 0;
};
