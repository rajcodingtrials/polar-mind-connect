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

// Simple Soundex implementation for phonetic comparison
function soundex(s: string): string {
  const a = s.toLowerCase().split('');
  const f = a.shift();
  if (!f) return '';
  const codes: { [key: string]: string } = {
    a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
    b: '1', f: '1', p: '1', v: '1',
    c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
    d: '3', t: '3',
    l: '4',
    m: '5', n: '5',
    r: '6'
  };
  const output =
    f.toUpperCase() +
    a
      .map(c => codes[c] || '')
      .filter((c, i, arr) => i === 0 || c !== arr[i - 1])
      .join('');
  return (output + '000').slice(0, 4);
}

// Returns a score between 0 and 1 based on phonetic similarity
export function getPhoneticScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const sxA = soundex(a);
  const sxB = soundex(b);
  return sxA === sxB ? 1 : 0;
}

// Returns true if the phonetic score is above a threshold
export function isPhoneticallySimilar(a: string, b: string, threshold: number = 0.7): boolean {
  return getPhoneticScore(a, b) >= threshold;
}
