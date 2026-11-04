import React, { useState } from 'react';
import { GraduationCap, X, CheckCircle2 } from 'lucide-react';
import { TrainInput } from '../types';

interface TeachModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  initialResponse?: string;
  onTeach: (input: TrainInput) => Promise<boolean>;
}

export const TeachModal: React.FC<TeachModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialResponse,
  onTeach
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState(initialResponse || '');
  const [category, setCategory] = useState('corrections');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync initial props
  React.useEffect(() => {
    setPrompt(initialPrompt);
    setResponse(initialResponse || '');
  }, [initialPrompt, initialResponse]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !response.trim()) return;

    setIsSubmitting(true);
    const ok = await onTeach({
      prompt: prompt.trim(),
      response: response.trim(),
      category,
      priority: 'high'
    });

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] text-neutral-900 dark:text-neutral-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-base">Teach / Correct Chotu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {success ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Chotu ne seekh liya! 🌟
              </div>
              <p className="text-neutral-500">
                Memory node update ho gaya. Agli baar yeh sahi jawab dega!
              </p>
            </div>
          ) : (
            <>
              <p className="text-neutral-500 leading-relaxed">
                Agar Chotu ne galat ya adhura jawab diya ho, toh yahan sahi jawab enter karein. Chotu bachhe ki tarah ise yaad kar lega.
              </p>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  User Question / Prompt
                </label>
                <input
                  type="text"
                  required
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Bharat ki rajdhani kya hai?"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  Correct Answer (Sahi Jawab)
                </label>
                <textarea
                  required
                  rows={4}
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  placeholder="Enter the correct, accurate answer..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. science, coding, general"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !prompt.trim() || !response.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{isSubmitting ? 'Reinforcing Memory...' : 'Teach Chotu'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
