import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  Menu,
  RotateCcw,
  Zap,
  Info,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Conversation, ChatMessage, AIPersonality } from '../types';
import { speakText, stopSpeaking, startVoiceRecognition, isSpeechRecognitionSupported } from '../utils/speech';

interface ChatViewProps {
  conversation: Conversation | null;
  personality: AIPersonality;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onOpenSidebar: () => void;
  onOpenPersonalityModal: () => void;
  onOpenTeachModal: (prompt: string, initialResponse?: string) => void;
  isOffline: boolean;
  enableHybridBooster: boolean;
  onToggleHybridBooster: () => void;
}

const PROMPT_SUGGESTIONS = [
  {
    category: '🇮🇳 Namaste & Parichay',
    prompts: [
      'Namaste! Tum kaun ho aur kya kar sakte ho?',
      'Bharat ki rajdhani kya hai aur iska mahatva?',
      'Ek mazedaar chutkula sunao!'
    ]
  },
  {
    category: '🎓 Child-Learning & Teaching',
    prompts: [
      'Tumhe bachho ki tarah kaise train karein?',
      'What is photosynthesis in simple words?',
      'Photosynthesis ka formula samjhao'
    ]
  },
  {
    category: '💻 Coding & Tech',
    prompts: [
      'How to reverse a string in JavaScript?',
      'Write Fibonacci series in Python',
      'Tumhara REST API endpoint kaise call karein?'
    ]
  },
  {
    category: '🧮 Math & Logic',
    prompts: [
      'Calculate 125 * 8 + 50',
      'What is Pythagoras theorem formula?',
      'Calculate 999 / 9'
    ]
  }
];

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  personality,
  onSendMessage,
  isLoading,
  onOpenSidebar,
  onOpenPersonalityModal,
  onOpenTeachModal,
  isOffline,
  enableHybridBooster,
  onToggleHybridBooster
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionControllerRef = useRef<{ stop: () => void } | null>(null);

  // Auto-scroll to bottom of messages only when messages exist
  useEffect(() => {
    if (conversation?.messages && conversation.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, isLoading]);

  // Handle textarea resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);
    speakText(text, {
      tone: personality.tone,
      onEnd: () => setSpeakingId(null)
    });
  };

  // Toggle voice speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionControllerRef.current?.stop();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    setIsListening(true);

    const controller = startVoiceRecognition(
      transcript => {
        setInputText(transcript);
      },
      err => {
        setVoiceError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    recognitionControllerRef.current = controller;
  };

  // Helper to render markdown-like content (code blocks, bold, lists)
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim().match(/^[a-z]+/i) ? lines[0].trim() : '';
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-2.5 rounded-lg overflow-hidden border border-neutral-700/60 bg-[#1e1e1e] text-neutral-100 text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-800/80 border-b border-neutral-700/50 text-[11px] text-neutral-400 font-mono">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => handleCopy(code, `code-${index}`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
                aria-label="Copy code block"
              >
                {copiedId === `code-${index}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-[12px] leading-relaxed whitespace-pre">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format bold text and line breaks
      const formattedLines = part.split('\n').map((line, lIdx) => {
        // Simple inline code `...`
        const inlineCodeParts = line.split(/(`[^`]+`)/g);

        return (
          <p key={lIdx} className={`${line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}`}>
            {inlineCodeParts.map((sub, sIdx) => {
              if (sub.startsWith('`') && sub.endsWith('`')) {
                return (
                  <code key={sIdx} className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] bg-neutral-200 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400">
                    {sub.slice(1, -1)}
                  </code>
                );
              }
              // Format **bold**
              const boldParts = sub.split(/(\*\*[^*]+\*\*)/g);
              return boldParts.map((b, bIdx) => {
                if (b.startsWith('**') && b.endsWith('**')) {
                  return <strong key={bIdx} className="font-semibold text-neutral-900 dark:text-neutral-100">{b.slice(2, -2)}</strong>;
                }
                return b;
              });
            })}
          </p>
        );
      });

      return <div key={index} className="space-y-1">{formattedLines}</div>;
    });
  };

  const messages = conversation?.messages || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#212121] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Personality pill button */}
          <button
            onClick={onOpenPersonalityModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-all"
            aria-label="Change AI Personality"
          >
            <span className="text-base">{personality.avatar}</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{personality.name}</span>
            <span className="text-[10px] text-neutral-400">▼</span>
          </button>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2">
          {/* Offline / Online indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOffline
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}
            title={isOffline ? 'Running fully offline with Local Brain Engine' : 'Connected to Local Brain & REST API Server'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span>{isOffline ? 'Offline Mode' : 'Brain Active'}</span>
          </div>

          {/* Hybrid Booster toggle */}
          <button
            onClick={onToggleHybridBooster}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              enableHybridBooster
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Toggle Gemini Hybrid Booster for complex multi-step reasoning"
          >
            <Zap className={`w-3 h-3 ${enableHybridBooster ? 'text-indigo-500' : 'text-neutral-400'}`} />
            <span>Booster: {enableHybridBooster ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {/* Empty Conversation Welcome Screen */}
          {messages.length === 0 && (
            <div className="pt-2 sm:pt-6 pb-6 space-y-5 sm:space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-2xl sm:text-3xl shadow-xs">
                  {personality.avatar}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Namaste! Main {personality.name} hoon.
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                  Aapka apna autonomous intelligence model. Mujhe bilkul bachho ki tarah sikhaya ja sakta hai, offline chala sakte hain, aur mera REST API bhi call kar sakte hain.
                </p>
              </div>

              {/* Categorized Prompt Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {PROMPT_SUGGESTIONS.map((category, catIdx) => (
                  <div
                    key={catIdx}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-2"
                  >
                    <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                      {category.category}
                    </div>
                    <div className="space-y-1.5">
                      {category.prompts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => onSendMessage(p)}
                          className="w-full text-left text-xs p-2 rounded-lg bg-white dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 border border-neutral-200/80 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300 transition-colors block truncate"
                        >
                          "{p}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Thread */}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm shrink-0 shadow-xs mt-0.5">
                  {personality.avatar || '👶'}
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-900 dark:text-neutral-100 rounded-br-xs'
                    : 'bg-transparent text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {/* Content */}
                <div className="leading-relaxed">
                  {renderMessageContent(msg.content)}
                </div>

                {/* Assistant Metadata & Actions */}
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      {msg.confidence !== undefined && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            msg.confidence >= 0.7
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <Cpu className="w-2.5 h-2.5" />
                          {Math.round(msg.confidence * 100)}% match
                        </span>
                      )}

                      {msg.source && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          {msg.source === 'hybrid' ? '⚡ Hybrid' : '🧠 Brain Engine'}
                        </span>
                      )}

                      {msg.latencyMs !== undefined && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Teach / Correct button */}
                      <button
                        onClick={() => {
                          const prevUserMsg = messages
                            .slice(0, messages.findIndex(m => m.id === msg.id))
                            .reverse()
                            .find(m => m.role === 'user');
                          onOpenTeachModal(prevUserMsg?.content || '', msg.content);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Teach or correct this answer like a child"
                        aria-label="Teach or correct this answer"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Teach / Correct</span>
                      </button>

                      {/* TTS Speak */}
                      <button
                        onClick={() => handleSpeak(msg.content, msg.id)}
                        className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                          speakingId === msg.id ? 'text-emerald-500' : 'text-neutral-400'
                        }`}
                        title={speakingId === msg.id ? 'Stop speaking' : 'Speak aloud'}
                        aria-label={speakingId === msg.id ? 'Stop voice reading' : 'Read message aloud'}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                        title="Copy text"
                        aria-label="Copy message text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm shrink-0 shadow-xs">
                {personality.avatar || '👶'}
              </div>
              <div className="py-2 px-3 rounded-2xl bg-neutral-100 dark:bg-[#2a2a2a] flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono">Chotu is thinking & reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Error Notice if any */}
      {voiceError && (
        <div className="mx-4 md:mx-auto max-w-3xl mb-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
          <span>{voiceError}</span>
          <button onClick={() => setVoiceError(null)} className="text-neutral-400 hover:text-neutral-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Input Box Area */}
      <footer className="p-4 md:px-8 lg:px-16 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#212121]">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {/* Main Input Container */}
          <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-neutral-300 dark:border-neutral-700/80 bg-neutral-50 dark:bg-[#2f2f2f] focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all shadow-xs">
            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening... Speak now' : 'Message ChotuAI... (or teach new concepts)'}
              className="flex-1 bg-transparent border-0 focus:outline-hidden text-sm resize-none px-2 py-1.5 max-h-44 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 leading-relaxed"
            />

            {/* Voice Input Microphone Button */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice recognition (Speech-to-Text)'}
              aria-label={isListening ? 'Stop listening voice' : 'Start speech recognition'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                  : 'text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800/50 cursor-not-allowed'
              }`}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy & Fast search status caption */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              100% Private • Local Memory • Child-Learnable Engine
            </span>
            <span className="hidden sm:inline">
              Press Enter to send, Shift+Enter for newline
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
