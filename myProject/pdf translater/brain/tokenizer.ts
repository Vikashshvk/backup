/**
 * Tokenizer & Text Preprocessor for ChotuAI Brain
 * Supports English, Hindi transliteration (Hinglish), and basic Devanagari.
 */

// Common stopwords in English and Hinglish that don't carry primary concept weight
export const STOPWORDS = new Set([
  // English
  'a', 'about', 'above', 'after', 'again', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',

  // Hinglish common functional words
  'hai', 'hain', 'ho', 'hote', 'tha', 'thi', 'the', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par',
  'aur', 'ya', 'to', 'bhi', 'kya', 'kyun', 'kaise', 'kab', 'kahan', 'kaun', 'mera', 'meri', 'mere',
  'tera', 'teri', 'tere', 'apna', 'apni', 'apne', 'hum', 'tum', 'aap', 'woh', 'yeh', 'unka', 'iska',
  'karo', 'karein', 'karna', 'batao', 'bataiye', 'de', 'do', 'lo', 'le'
]);

/**
 * Clean and normalize text
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0900-\u097F\+\-\*\/\=\<\>\?\!\.]/gi, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Extract tokens from text
 */
export function tokenize(text: string, removeStopwords = false): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  // Match words, numbers, and common mathematical / code symbols
  const words = normalized
    .split(/\s+/)
    .map(w => w.replace(/^[\.,!?;:]+|[\.,!?;:]+$/g, '').trim())
    .filter(w => w.length > 0);

  if (!removeStopwords) {
    return words;
  }

  const filtered = words.filter(w => !STOPWORDS.has(w) && w.length > 1);
  return filtered.length > 0 ? filtered : words;
}

/**
 * Generate n-grams (unigrams and bigrams) for better contextual phrasing
 */
export function generateNGrams(tokens: string[], maxN = 2): string[] {
  const ngrams: string[] = [...tokens];
  if (maxN < 2 || tokens.length < 2) return ngrams;

  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }

  if (maxN >= 3 && tokens.length >= 3) {
    for (let i = 0; i < tokens.length - 2; i++) {
      ngrams.push(`${tokens[i]}_${tokens[i + 1]}_${tokens[i + 2]}`);
    }
  }

  return ngrams;
}

/**
 * Calculate Term Frequency (TF) for a token list
 */
export function calculateTF(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize by total tokens
  for (const token in tf) {
    tf[token] = tf[token] / tokens.length;
  }

  return tf;
}

/**
 * Cosine similarity between two TF-IDF / frequency vectors
 */
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key in vecA) {
    normA += vecA[key] * vecA[key];
    if (key in vecB) {
      dotProduct += vecA[key] * vecB[key];
    }
  }

  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * Detect Intent from text
 */
export function detectIntent(text: string): {
  intent: 'greeting' | 'identity' | 'factual' | 'coding' | 'math' | 'explanation' | 'creative' | 'teach' | 'general';
  confidence: number;
} {
  const lower = text.toLowerCase().trim();

  // Greeting patterns
  if (
    /^(hi|hello|hey|namaste|pranam|ram ram|salaam|good morning|good evening|wassup|kya haal)/i.test(lower) ||
    /(kaise ho|kaisi ho|kya chal raha)/i.test(lower)
  ) {
    return { intent: 'greeting', confidence: 0.95 };
  }

  // Identity patterns
  if (
    /(who are you|kaun ho tum|apna parichay|what is your name|tumhara naam|kisne banaya|who made you|who created you)/i.test(lower)
  ) {
    return { intent: 'identity', confidence: 0.98 };
  }

  // Teach / Training patterns
  if (
    /(teach|sikh|sikho|sikha|yaad rakh|remember this|correct answer is|iska jawab yeh hai|galat hai)/i.test(lower)
  ) {
    return { intent: 'teach', confidence: 0.9 };
  }

  // Math patterns
  if (
    /(\d+\s*[\+\-\*\/]\s*\d+)|(calculate|square root|solve|hisab|jod|ghata)/i.test(lower)
  ) {
    return { intent: 'math', confidence: 0.85 };
  }

  // Coding patterns
  if (
    /(code|function|javascript|typescript|python|html|css|react|bug|algorithm|api|loop|array|sql|backend)/i.test(lower)
  ) {
    return { intent: 'coding', confidence: 0.9 };
  }

  // Creative patterns
  if (
    /(story|kahani|poem|kavita|shayari|joke|chutkula|song|gana)/i.test(lower)
  ) {
    return { intent: 'creative', confidence: 0.9 };
  }

  // Explanation patterns
  if (
    /(explain|batao|samjhao|kya hota hai|what is|how does|why is)/i.test(lower)
  ) {
    return { intent: 'explanation', confidence: 0.85 };
  }

  return { intent: 'general', confidence: 0.7 };
}
