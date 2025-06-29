import { Metaphone, SoundEx } from 'natural';

// Common speech delay patterns for young children
const speechDelayPatterns = [
  // Final consonant deletion
  { pattern: /t$/, replacement: '' },
  { pattern: /d$/, replacement: '' },
  { pattern: /k$/, replacement: '' },
  { pattern: /g$/, replacement: '' },
  { pattern: /p$/, replacement: '' },
  { pattern: /b$/, replacement: '' },
  
  // Consonant cluster reduction
  { pattern: /st/g, replacement: 't' },
  { pattern: /sp/g, replacement: 'p' },
  { pattern: /sk/g, replacement: 'k' },
  { pattern: /tr/g, replacement: 't' },
  { pattern: /dr/g, replacement: 'd' },
  { pattern: /pl/g, replacement: 'p' },
  { pattern: /bl/g, replacement: 'b' },
  { pattern: /cl/g, replacement: 'c' },
  { pattern: /gl/g, replacement: 'g' },
  { pattern: /fl/g, replacement: 'f' },
  { pattern: /br/g, replacement: 'b' },
  { pattern: /cr/g, replacement: 'c' },
  { pattern: /gr/g, replacement: 'g' },
  { pattern: /fr/g, replacement: 'f' },
  { pattern: /pr/g, replacement: 'p' },
  
  // Common substitutions
  { pattern: /th/g, replacement: 'f' }, // "fing" for "thing"
  { pattern: /r/g, replacement: 'w' },   // "wabbit" for "rabbit"
  { pattern: /l/g, replacement: 'w' },   // "wion" for "lion"
  
  // Syllable reduction patterns
  { pattern: /^ba/, replacement: '' },   // "nana" for "banana"
  { pattern: /^el/, replacement: '' },   // "phant" for "elephant"
];

export const generateSpeechDelayVariants = (word: string): string[] => {
  const variants = [word];
  const normalizedWord = word.toLowerCase().trim();
  
  // Apply each speech delay pattern
  speechDelayPatterns.forEach(({ pattern, replacement }) => {
    const variant = normalizedWord.replace(pattern, replacement);
    if (variant !== normalizedWord && variant.length > 0) {
      variants.push(variant);
    }
  });
  
  // Add some common specific cases
  const specificMappings: { [key: string]: string[] } = {
    'apple': ['appo', 'apo', 'app'],
    'water': ['wawa', 'wa', 'wata'],
    'banana': ['nana', 'bana', 'naa'],
    'elephant': ['ephant', 'phant', 'efen'],
    'bottle': ['baba', 'bot', 'botte'],
    'cookie': ['coo', 'tookie', 'kookie'],
    'daddy': ['dada', 'da', 'daddy'],
    'mommy': ['mama', 'ma', 'momy'],
    'kitty': ['titty', 'ki', 'kiki'],
    'doggy': ['doggie', 'do', 'gogy'],
    'ball': ['ba', 'baw', 'bow'],
    'car': ['ca', 'tar'],
    'book': ['boo', 'bu'],
    'milk': ['mi', 'mik'],
    'shoes': ['shu', 'shoe'],
    'house': ['hou', 'hous'],
    'tree': ['twee', 'tee'],
    'flower': ['fower', 'fowow', 'fow'],
    'spoon': ['poon', 'soon', 'poo'],
    'train': ['tain', 'twain', 'tai']
  };
  
  if (specificMappings[normalizedWord]) {
    variants.push(...specificMappings[normalizedWord]);
  }
  
  return [...new Set(variants)]; // Remove duplicates
};

export const calculatePhoneticSimilarity = (word1: string, word2: string): number => {
  const metaphone1 = Metaphone.process(word1);
  const metaphone2 = Metaphone.process(word2);
  const soundex1 = SoundEx.process(word1);
  const soundex2 = SoundEx.process(word2);
  
  // Check if phonetic codes match
  const metaphoneMatch = metaphone1 === metaphone2 ? 1 : 0;
  const soundexMatch = soundex1 === soundex2 ? 1 : 0;
  
  // Return highest phonetic similarity
  return Math.max(metaphoneMatch, soundexMatch);
};
