/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Conversation,
  ChatMessage,
  AIPersonality,
  ActiveTab,
  TrainInput,
  BrainStats
} from './types';
import {
  getStoredConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  getStoredTheme,
  saveTheme,
  getStoredPersonalities,
  savePersonalities,
  localOfflineBrain,
  saveLocalBrainState
} from './utils/storage';
import { DEFAULT_PERSONALITIES } from '../brain/seed-data';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { TeacherStudio } from './components/TeacherStudio';
import { ApiPlayground } from './components/ApiPlayground';
import { PersonalityModal } from './components/PersonalityModal';
import { SyncModal } from './components/SyncModal';
import { TeachModal } from './components/TeachModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => getStoredConversations());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveConversationId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());
  const [personalities, setPersonalities] = useState<AIPersonality[]>(() => getStoredPersonalities());
  const [activePersonality, setActivePersonality] = useState<AIPersonality>(() => personalities[0] || DEFAULT_PERSONALITIES[0]);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [enableHybridBooster, setEnableHybridBooster] = useState(false);
  const [brainStats, setBrainStats] = useState<BrainStats | null>(null);

  // Modal states
  const [personalityModalOpen, setPersonalityModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [teachModalOpen, setTeachModalOpen] = useState(false);
  const [teachPrompt, setTeachPrompt] = useState('');
  const [teachResponse, setTeachResponse] = useState('');

  // Sync theme to document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Responsive resize listener for mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch brain stats & health on mount
  const fetchBrainStats = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBrainStats(data.stats);
        if (data.geminiBoosterAvailable) {
          setEnableHybridBooster(true);
        }
      } else {
        setBrainStats(localOfflineBrain.getStats());
      }
    } catch {
      // In offline or static mode, use local in-browser Brain
      setBrainStats(localOfflineBrain.getStats());
    }
  }, []);

  useEffect(() => {
    fetchBrainStats();
  }, [fetchBrainStats]);

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    if (activeId) {
      setActiveConversationId(activeId);
    }
  }, [activeId]);

  // Keyboard shortcut for New Chat (Cmd/Ctrl + N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
        setActiveTab('chat');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Conversation Helpers
  const activeConversation = conversations.find(c => c.id === activeId) || null;

  const handleNewConversation = () => {
    setActiveId(null);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleTogglePin = (id: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all chat history?')) {
      setConversations([]);
      setActiveId(null);
    }
  };

  // Primary Message Handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    let targetConvId = activeId;
    let updatedConversations = [...conversations];

    // If no active conversation, create a new one
    if (!targetConvId) {
      const newId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      // Generate short clean title
      const titleWords = text.trim().split(/\s+/).slice(0, 6).join(' ');
      const newTitle = titleWords.length > 30 ? titleWords.slice(0, 30) + '...' : titleWords;

      const newConv: Conversation = {
        id: newId,
        title: newTitle || 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personalityId: activePersonality.id
      };

      updatedConversations.unshift(newConv);
      targetConvId = newId;
      setActiveId(newId);
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    updatedConversations = updatedConversations.map(c => {
      if (c.id === targetConvId) {
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      let assistantResult: any;

      // Try server endpoint first
      if (!isOffline) {
        try {
          const res = await fetch('/api/brain/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: text,
              personality: activePersonality,
              enableHybridBooster
            })
          });

          if (res.ok) {
            assistantResult = await res.json();
          } else {
            throw new Error('Server returned non-ok');
          }
        } catch {
          // Fall back seamlessly to client-side localOfflineBrain!
          assistantResult = localOfflineBrain.generate({
            prompt: text,
            personality: activePersonality
          });
        }
      } else {
        // Pure Offline Mode: Instant in-browser autonomous brain
        assistantResult = localOfflineBrain.generate({
          prompt: text,
          personality: activePersonality
        });
      }

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: `msg-ast-${Date.now()}`,
        role: 'assistant',
        content: assistantResult.text,
        timestamp: Date.now(),
        confidence: assistantResult.confidence,
        intent: assistantResult.intent,
        needsTeaching: assistantResult.needsTeaching,
        tokensUsed: assistantResult.tokensUsed,
        latencyMs: assistantResult.latencyMs,
        source: assistantResult.source,
        matchedNodes: assistantResult.matchedNodes
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: [...c.messages, assistantMsg],
              updatedAt: Date.now()
            };
          }
          return c;
        })
      );

      // Refresh memory stats
      fetchBrainStats();
    } catch (err: any) {
      console.error('Generation error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err?.message || 'Failed to generate response.'}`,
        timestamp: Date.now(),
        confidence: 0,
        source: 'brain'
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: [...c.messages, fallbackMsg],
              updatedAt: Date.now()
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Train Handler ("Bachho ki tarah sikhe")
  const handleTrain = async (input: TrainInput): Promise<boolean> => {
    try {
      // 1. Train local in-browser brain for offline parity
      localOfflineBrain.train(input);
      saveLocalBrainState();

      // 2. Train backend server brain
      if (!isOffline) {
        await fetch('/api/brain/train', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      }

      fetchBrainStats();
      return true;
    } catch (err) {
      console.warn('Training error:', err);
      return false;
    }
  };

  // Export & Import weights
  const handleExportModel = () => {
    const data = localOfflineBrain.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chotu-model-weights-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportModel = async (file: File): Promise<boolean> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = async event => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          localOfflineBrain.importData(parsed);
          saveLocalBrainState();

          if (!isOffline) {
            await fetch('/api/brain/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsed)
            });
          }

          fetchBrainStats();
          alert('Model weights imported successfully! 🎉');
          resolve(true);
        } catch {
          alert('Invalid model weights JSON file.');
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  // Cross-device sync restore
  const handleRestoreData = (restoredConvs: Conversation[], restoredBrain?: any) => {
    if (restoredConvs && Array.isArray(restoredConvs)) {
      setConversations(restoredConvs);
      if (restoredConvs.length > 0) {
        setActiveId(restoredConvs[0].id);
      }
    }
    if (restoredBrain) {
      localOfflineBrain.importData(restoredBrain);
      saveLocalBrainState();
    }
    fetchBrainStats();
  };

  // Custom personality save
  const handleSaveCustomPersonality = (newP: AIPersonality) => {
    const updated = [...personalities, newP];
    setPersonalities(updated);
    savePersonalities(updated);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#121212] font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        activeTab={activeTab}
        onSelectConversation={id => setActiveId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        onClearAll={handleClearAll}
        onTabChange={tab => setActiveTab(tab)}
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(o => !o)}
        isOffline={isOffline}
        modelStats={brainStats ? { totalNodes: brainStats.totalNodes, totalVocabulary: brainStats.totalVocabulary } : undefined}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeTab === 'chat' && (
          <ChatView
            conversation={activeConversation}
            personality={activePersonality}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onOpenSidebar={() => setSidebarOpen(o => !o)}
            onOpenPersonalityModal={() => setPersonalityModalOpen(true)}
            onOpenTeachModal={(prompt, initialResponse) => {
              setTeachPrompt(prompt);
              setTeachResponse(initialResponse || '');
              setTeachModalOpen(true);
            }}
            isOffline={isOffline}
            enableHybridBooster={enableHybridBooster}
            onToggleHybridBooster={() => setEnableHybridBooster(b => !b)}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherStudio
            stats={brainStats}
            onTrain={handleTrain}
            onRefreshStats={fetchBrainStats}
            onExportModel={handleExportModel}
            onImportModel={handleImportModel}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'api' && <ApiPlayground />}

        {/* Sync Modal (when triggered via tab or button) */}
        {activeTab === 'sync' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <SyncModal
              isOpen={true}
              onClose={() => setActiveTab('chat')}
              conversations={conversations}
              onRestoreData={handleRestoreData}
            />
          </div>
        )}

        {/* Personality Picker (when triggered via tab or button) */}
        {activeTab === 'personalities' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <PersonalityModal
              isOpen={true}
              onClose={() => setActiveTab('chat')}
              personalities={personalities}
              activePersonality={activePersonality}
              onSelectPersonality={p => {
                setActivePersonality(p);
                setActiveTab('chat');
              }}
              onSaveCustomPersonality={handleSaveCustomPersonality}
            />
          </div>
        )}
      </main>

      {/* Overlaid Modals */}
      <PersonalityModal
        isOpen={personalityModalOpen}
        onClose={() => setPersonalityModalOpen(false)}
        personalities={personalities}
        activePersonality={activePersonality}
        onSelectPersonality={p => {
          setActivePersonality(p);
          setPersonalityModalOpen(false);
        }}
        onSaveCustomPersonality={handleSaveCustomPersonality}
      />

      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        conversations={conversations}
        onRestoreData={handleRestoreData}
      />

      <TeachModal
        isOpen={teachModalOpen}
        onClose={() => setTeachModalOpen(false)}
        initialPrompt={teachPrompt}
        initialResponse={teachResponse}
        onTeach={handleTrain}
      />
    </div>
  );
}
