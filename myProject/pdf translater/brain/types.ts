/**
 * Types for the custom autonomous AI Brain engine
 */

export type IntentType = 
  | 'greeting'
  | 'identity'
  | 'factual'
  | 'coding'
  | 'math'
  | 'explanation'
  | 'creative'
  | 'teach'
  | 'general';

export interface KnowledgeNode {
  id: string;
  prompt: string;
  response: string;
  category: string;
  keywords: string[];
  weight: number; // 1 to 10
  confidence: number; // 0 to 1
  learnedAt: number;
  source: 'seed' | 'teacher' | 'feedback' | 'chat';
  timesRecalled: number;
}

export interface AIPersonality {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tone: 'child' | 'scholar' | 'dost' | 'coder' | 'creative';
  systemPrompt: string;
  temperature: number; // 0.1 to 1.0
  creativity: number;
  languageStyle: 'hinglish' | 'english' | 'hindi';
  isCustom?: boolean;
}

export interface GenerateOptions {
  prompt: string;
  personality?: AIPersonality;
  temperature?: number;
  maxTokens?: number;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableHybridBooster?: boolean;
}

export interface GenerateResult {
  text: string;
  tokensUsed: number;
  confidence: number;
  intent: IntentType;
  matchedNodes: string[];
  latencyMs: number;
  source: 'brain' | 'hybrid';
  needsTeaching?: boolean;
}

export interface TrainInput {
  prompt: string;
  response: string;
  category?: string;
  priority?: 'normal' | 'high';
}

export interface BrainStats {
  name: string;
  version: string;
  totalVocabulary: number;
  totalNodes: number;
  trainedByTeacher: number;
  seedNodes: number;
  avgConfidence: number;
  totalInteractions: number;
}

export interface BrainExportData {
  version: string;
  name: string;
  exportedAt: number;
  vocabulary: Record<string, number>;
  nodes: KnowledgeNode[];
  totalInteractions: number;
}
