import { Conversation, ChatMessage, AIPersonality } from '../types';
import { DEFAULT_PERSONALITIES } from '../../brain/seed-data';
import { BrainEngine } from '../../brain/engine';

const CONVERSATIONS_KEY = 'chotuai_conversations_v2';
const ACTIVE_CONV_KEY = 'chotuai_active_conv_id';
const THEME_KEY = 'chotuai_theme';
const PERSONALITIES_KEY = 'chotuai_personalities';
const LOCAL_BRAIN_KEY = 'chotuai_local_brain_data';

// Create a local in-browser Brain instance for zero-latency 100% offline generation
export const localOfflineBrain = new BrainEngine();

// Load any previously persisted brain weights
try {
  const savedBrain = localStorage.getItem(LOCAL_BRAIN_KEY);
  if (savedBrain) {
    localOfflineBrain.importData(JSON.parse(savedBrain));
  }
} catch (e) {
  console.warn('Could not restore local offline brain:', e);
}

export function saveLocalBrainState() {
  try {
    const data = localOfflineBrain.exportData();
    localStorage.setItem(LOCAL_BRAIN_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save local offline brain:', e);
  }
}

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveConversations(convs: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch (err) {
    console.error('Failed to save conversations to storage:', err);
  }
}

export function getActiveConversationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CONV_KEY);
  } catch {
    return null;
  }
}

export function setActiveConversationId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } catch {}
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark') return theme;
    // Default to dark mode as requested by user
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function getStoredPersonalities(): AIPersonality[] {
  try {
    const raw = localStorage.getItem(PERSONALITIES_KEY);
    if (!raw) return DEFAULT_PERSONALITIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PERSONALITIES;
  } catch {
    return DEFAULT_PERSONALITIES;
  }
}

export function savePersonalities(personalities: AIPersonality[]): void {
  try {
    localStorage.setItem(PERSONALITIES_KEY, JSON.stringify(personalities));
  } catch {}
}

/**
 * Fast client-side search index across all conversations and messages
 */
export interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageId?: string;
  matchedText: string;
  role?: 'user' | 'assistant';
  timestamp: number;
}

export function searchChatHistory(query: string, conversations: Conversation[]): SearchResult[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const conv of conversations) {
    // Check conversation title
    if (conv.title.toLowerCase().includes(q)) {
      results.push({
        conversationId: conv.id,
        conversationTitle: conv.title,
        matchedText: `Title match: ${conv.title}`,
        timestamp: conv.updatedAt
      });
    }

    // Check individual messages
    for (const msg of conv.messages) {
      const idx = msg.content.toLowerCase().indexOf(q);
      if (idx !== -1) {
        // Snippet around match
        const start = Math.max(0, idx - 30);
        const end = Math.min(msg.content.length, idx + q.length + 50);
        const snippet = (start > 0 ? '...' : '') + msg.content.substring(start, end) + (end < msg.content.length ? '...' : '');

        results.push({
          conversationId: conv.id,
          conversationTitle: conv.title,
          messageId: msg.id,
          matchedText: snippet,
          role: msg.role,
          timestamp: msg.timestamp
        });
      }
    }
  }

  // Sort by recent timestamp
  return results.sort((a, b) => b.timestamp - a.timestamp);
}
