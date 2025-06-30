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
    'dog': ['doe', 'doggie', 'doggy', 'do'],
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

// Levenshtein distance for edit similarity
export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
      );
    }
  }
  return matrix[bn][an];
}

// Simple Metaphone implementation (not full, but good for English children's words)
export function metaphone(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return '';
  // Drop duplicate adjacent letters except for c
  w = w[0] + w.slice(1).replace(/([^c])\1+/g, '$1');
  // Drop initial kn, gn, pn, ae, wr
  w = w.replace(/^(kn|gn|pn|ae|wr)/, '');
  // Drop b after m at end
  w = w.replace(/mb$/, 'm');
  // c -> x (sh) or s or k
  w = w.replace(/cia/, 'xia');
  w = w.replace(/ch/, 'x');
  w = w.replace(/c(?=ia)/, 'x');
  w = w.replace(/c([iey])/, 's$1');
  w = w.replace(/c/, 'k');
  // d -> j or t
  w = w.replace(/dge|dge/, 'j');
  w = w.replace(/d/, 't');
  // g -> j or k
  w = w.replace(/gh(?![aeiou])/, '');
  w = w.replace(/gn(ed)?$/, 'n');
  w = w.replace(/g([iey])/, 'j$1');
  w = w.replace(/g/, 'k');
  // h silent after c, s, p, t, g
  w = w.replace(/([cspgt])h/, '$1');
  // k -> '' if after c else k
  w = w.replace(/ck/, 'k');
  w = w.replace(/k(?=n)/, '');
  // ph -> f
  w = w.replace(/ph/, 'f');
  // q -> k
  w = w.replace(/q/, 'k');
  // s -> x (sh)
  w = w.replace(/sh/, 'x');
  // th -> 0
  w = w.replace(/th/, '0');
  // v -> f
  w = w.replace(/v/, 'f');
  // w if not followed by a vowel
  w = w.replace(/w([^aeiou])/, '$1');
  // x -> s
  w = w.replace(/^x/, 's');
  // y if not followed by a vowel
  w = w.replace(/y([^aeiou])/, '$1');
  // z -> s
  w = w.replace(/z/, 's');
  // Remove all vowels except first
  w = w[0] + w.slice(1).replace(/[aeiou]/g, '');
  return w;
}

// Get a similarity score between 0 and 1 (1 = identical)
export function getPhoneticScore(word1: string, word2: string): number {
  const norm1 = word1.toLowerCase().trim();
  const norm2 = word2.toLowerCase().trim();
  if (norm1 === norm2) return 1;
  // Check variants
  const variants1 = generateSpeechDelayVariants(norm1);
  const variants2 = generateSpeechDelayVariants(norm2);
  if (variants1.includes(norm2) || variants2.includes(norm1)) return 0.95;
  // Levenshtein normalized
  const lev = levenshtein(norm1, norm2);
  const maxLen = Math.max(norm1.length, norm2.length);
  const levScore = 1 - lev / maxLen;
  // Metaphone match
  const meta1 = metaphone(norm1);
  const meta2 = metaphone(norm2);
  const metaScore = meta1 === meta2 ? 0.9 : 0;
  // Weighted: direct variant > metaphone > levenshtein
  return Math.max(levScore, metaScore);
}

// Returns true if words are phonetically similar (threshold adjustable)
export function isPhoneticallySimilar(word1: string, word2: string, threshold = 0.7): boolean {
  return getPhoneticScore(word1, word2) >= threshold;
}
