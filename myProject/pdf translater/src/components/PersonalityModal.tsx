import React, { useState } from 'react';
import { Sparkles, X, Plus, Check } from 'lucide-react';
import { AIPersonality } from '../types';

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalities: AIPersonality[];
  activePersonality: AIPersonality;
  onSelectPersonality: (p: AIPersonality) => void;
  onSaveCustomPersonality: (p: AIPersonality) => void;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({
  isOpen,
  onClose,
  personalities,
  activePersonality,
  onSelectPersonality,
  onSaveCustomPersonality
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('✨');
  const [tone, setTone] = useState<'child' | 'scholar' | 'dost' | 'coder' | 'creative'>('child');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPersonality: AIPersonality = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Custom Assistant',
      avatar: avatar.trim() || '🤖',
      tone,
      systemPrompt: systemPrompt.trim() || `You are ${name}. Respond thoughtfully.`,
      temperature,
      creativity: temperature,
      languageStyle: 'hinglish',
      isCustom: true
    };

    onSaveCustomPersonality(newPersonality);
    onSelectPersonality(newPersonality);
    setIsCreating(false);
    setName('');
    setRole('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] text-neutral-900 dark:text-neutral-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-base">Select or Customize AI Personality</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {!isCreating ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalities.map(p => {
                  const isSelected = p.id === activePersonality.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPersonality(p);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.avatar}</span>
                          <div>
                            <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {p.role}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {p.systemPrompt}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Personality</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-500 mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Einstein / Hindi Kavi"
                    className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1 font-medium">Avatar Emoji</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="w-full p-2 text-center text-base rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1 font-medium">Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Science Mentor / Creative Poet"
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1 font-medium">Tone Flavor</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                >
                  <option value="child">Child (Curious, Enthusiastic, Sweet)</option>
                  <option value="scholar">Scholar (Structured, Detailed, Academic)</option>
                  <option value="dost">Dost (Friendly Hinglish Buddy)</option>
                  <option value="coder">DevGuru (Code-first, Best Practices)</option>
                  <option value="creative">Creative (Poetic, Expressive)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1 font-medium">System Instructions</label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  placeholder="Define how this persona thinks, speaks, and formats answers..."
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-500 mb-1">
                  <span className="font-medium">Creativity Temperature: {temperature}</span>
                  <span>{temperature > 0.6 ? 'High (Creative)' : 'Low (Precise)'}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
