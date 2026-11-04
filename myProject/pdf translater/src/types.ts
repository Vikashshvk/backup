export type {
  IntentType,
  KnowledgeNode,
  AIPersonality,
  GenerateOptions,
  GenerateResult,
  TrainInput,
  BrainStats,
  BrainExportData
} from '../brain/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  confidence?: number;
  intent?: string;
  needsTeaching?: boolean;
  tokensUsed?: number;
  latencyMs?: number;
  source?: 'brain' | 'hybrid';
  matchedNodes?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  personalityId: string;
  isPinned?: boolean;
  tags?: string[];
}

export type ActiveTab = 'chat' | 'teacher' | 'api' | 'personalities' | 'sync';
