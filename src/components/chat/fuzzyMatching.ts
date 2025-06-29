
import Fuse from 'fuse.js';

export interface FuzzyMatchResult {
  isMatch: boolean;
  confidence: number;
  matchedText: string;
}

export const fuzzyMatchAnswer = (
  userResponse: string,
  expectedAnswer: string,
  threshold: number = 0.6
): FuzzyMatchResult => {
  // Clean and normalize both strings
  const cleanUserResponse = userResponse.toLowerCase().trim();
  const cleanExpectedAnswer = expectedAnswer.toLowerCase().trim();
  
  // Direct exact match check first
  if (cleanUserResponse.includes(cleanExpectedAnswer) || 
      cleanExpectedAnswer.includes(cleanUserResponse)) {
    return {
      isMatch: true,
      confidence: 1.0,
      matchedText: expectedAnswer
    };
  }
  
  // Split expected answer into words for flexible matching
  const expectedWords = cleanExpectedAnswer.split(/\s+/);
  const userWords = cleanUserResponse.split(/\s+/);
  
  // Check if user response contains key words from expected answer
  let matchedWords = 0;
  const totalWords = expectedWords.length;
  
  for (const expectedWord of expectedWords) {
    for (const userWord of userWords) {
      // Use Fuse.js for fuzzy matching individual words
      const fuse = new Fuse([expectedWord], {
        threshold: 0.4, // More lenient for individual words
        includeScore: true
      });
      
      const result = fuse.search(userWord);
      if (result.length > 0 && result[0].score! < 0.4) {
        matchedWords++;
        break;
      }
    }
  }
  
  const confidence = matchedWords / totalWords;
  
  return {
    isMatch: confidence >= threshold,
    confidence,
    matchedText: expectedAnswer
  };
};

export const getEncouragingFeedback = (confidence: number): string => {
  if (confidence >= 0.8) {
    return "That's very close! Great job! 🌟";
  } else if (confidence >= 0.6) {
    return "Good try! You're getting closer! 👍";
  } else if (confidence >= 0.4) {
    return "Nice attempt! Let's try again! 😊";
  } else {
    return "That's a good try! Let me help you with this one. 💪";
  }
};
