import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  GraduationCap,
  Terminal,
  Sparkles,
  Cloud,
  Moon,
  Sun,
  Trash2,
  Pin,
  Edit2,
  Check,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Conversation, ActiveTab } from '../types';
import { searchChatHistory } from '../utils/storage';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  activeTab: ActiveTab;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onClearAll: () => void;
  onTabChange: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isOffline: boolean;
  modelStats?: { totalNodes: number; totalVocabulary: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  activeTab,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  onClearAll,
  onTabChange,
  theme,
  onToggleTheme,
  isOpen,
  onToggleOpen,
  isOffline,
  modelStats
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Fast search results
  const searchResults = useMemo(() => {
    return searchChatHistory(searchQuery, conversations);
  }, [searchQuery, conversations]);

  // Group conversations by time
  const groupedConversations = useMemo(() => {
    const pinned = conversations.filter(c => c.isPinned);
    const unpinned = conversations.filter(c => !c.isPinned);

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    for (const c of unpinned) {
      const diff = now - c.updatedAt;
      if (diff < oneDay) {
        today.push(c);
      } else if (diff < 2 * oneDay) {
        yesterday.push(c);
      } else if (diff < 7 * oneDay) {
        last7Days.push(c);
      } else {
        older.push(c);
      }
    }

    return { pinned, today, yesterday, last7Days, older };
  }, [conversations]);

  const handleNav = (tab: ActiveTab) => {
    onTabChange(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 768 && isOpen) {
      onToggleOpen();
    }
  };

  const handleSelectConvMobile = (id: string) => {
    onSelectConversation(id);
    onTabChange('chat');
    if (typeof window !== 'undefined' && window.innerWidth < 768 && isOpen) {
      onToggleOpen();
    }
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs"
          onClick={onToggleOpen}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col transition-all duration-300 ease-in-out border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
        } ${
          theme === 'dark'
            ? 'bg-[#171717] border-neutral-800 text-neutral-200'
            : 'bg-[#f9f9f9] border-neutral-200 text-neutral-800'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Top Header & Brand */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              👶
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                ChotuAI
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  v2.4
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                {isOffline ? 'Offline Brain' : 'Autonomous Engine'}
              </div>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="md:hidden p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500"
            aria-label="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              onTabChange('chat');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-xs ${
              activeTab === 'chat' && activeId === null
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              New chat
            </span>
            <span className="text-[11px] opacity-60 font-mono">⌘N</span>
          </button>
        </div>

        {/* Fast Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search chats & memories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Special Features) */}
        <div className="px-3 py-1.5 space-y-0.5 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => handleNav('teacher')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'teacher'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span>Teacher Studio (Bachha Sikho)</span>
          </button>

          <button
            onClick={() => handleNav('api')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'api'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Terminal className="w-4 h-4 text-sky-500" />
            <span>API Playground & Docs</span>
          </button>

          <button
            onClick={() => handleNav('personalities')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'personalities'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Personalities</span>
          </button>

          <button
            onClick={() => handleNav('sync')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'sync'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Cloud className="w-4 h-4 text-indigo-500" />
            <span>Cloud & Device Sync</span>
          </button>
        </div>

        {/* Chat History List / Search Results */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
          {searchQuery ? (
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1.5">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="text-xs text-neutral-500 px-2 py-3 text-center">
                  Koi message ya conversation nahi mila.
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSelectConversation(res.conversationId);
                        onTabChange('chat');
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors group"
                    >
                      <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {res.conversationTitle}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {res.matchedText}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {groupedConversations.pinned.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                    Pinned
                  </div>
                  <div className="space-y-0.5">
                    {groupedConversations.pinned.map(c => renderConversationItem(c))}
                  </div>
                </div>
              )}

              {/* Today */}
              {groupedConversations.today.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                    Today
                  </div>
                  <div className="space-y-0.5">
                    {groupedConversations.today.map(c => renderConversationItem(c))}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {groupedConversations.yesterday.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                    Yesterday
                  </div>
                  <div className="space-y-0.5">
                    {groupedConversations.yesterday.map(c => renderConversationItem(c))}
                  </div>
                </div>
              )}

              {/* Previous 7 Days */}
              {groupedConversations.last7Days.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                    Previous 7 Days
                  </div>
                  <div className="space-y-0.5">
                    {groupedConversations.last7Days.map(c => renderConversationItem(c))}
                  </div>
                </div>
              )}

              {/* Older */}
              {groupedConversations.older.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                    Older
                  </div>
                  <div className="space-y-0.5">
                    {groupedConversations.older.map(c => renderConversationItem(c))}
                  </div>
                </div>
              )}

              {conversations.length === 0 && (
                <div className="text-center py-6 px-3 text-xs text-neutral-400">
                  No conversation history yet. Start a new chat!
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Footer & Settings */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          {modelStats && (
            <div className="px-2 py-1.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/40 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>Memory Nodes:</span>
              <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                {modelStats.totalNodes} ({modelStats.totalVocabulary} words)
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {conversations.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                title="Clear all chat history"
                aria-label="Clear all chats"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  function renderConversationItem(conv: Conversation) {
    const isSelected = activeTab === 'chat' && conv.id === activeId;
    const isEditing = editingId === conv.id;

    if (isEditing) {
      return (
        <form
          key={conv.id}
          onSubmit={e => handleSaveRename(conv.id, e)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800"
        >
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            autoFocus
            className="w-full text-xs bg-transparent border-0 focus:outline-hidden text-neutral-900 dark:text-neutral-100"
          />
          <button
            type="submit"
            className="p-1 text-emerald-600 hover:text-emerald-700"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="p-1 text-neutral-400 hover:text-neutral-500"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      );
    }

    return (
      <div
        key={conv.id}
        onClick={() => handleSelectConvMobile(conv.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
          isSelected
            ? 'bg-neutral-200/90 dark:bg-neutral-800 text-neutral-900 dark:text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-14">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
          <span className="truncate">{conv.title || 'New conversation'}</span>
        </div>

        {/* Hover action buttons */}
        <div className="absolute right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-200/90 dark:bg-neutral-800 px-1 rounded-md">
          <button
            onClick={e => {
              e.stopPropagation();
              onTogglePin(conv.id);
            }}
            className={`p-1 rounded hover:text-amber-500 ${conv.isPinned ? 'text-amber-500' : 'text-neutral-400'}`}
            title={conv.isPinned ? 'Unpin' : 'Pin chat'}
            aria-label={conv.isPinned ? 'Unpin' : 'Pin chat'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={e => handleStartRename(conv, e)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200"
            title="Rename"
            aria-label="Rename chat"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDeleteConversation(conv.id);
            }}
            className="p-1 rounded text-neutral-400 hover:text-red-500"
            title="Delete"
            aria-label="Delete chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
};
