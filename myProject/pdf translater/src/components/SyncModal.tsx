import React, { useState } from 'react';
import { Cloud, X, Copy, Check, Download, Upload, ShieldCheck, ArrowRight, Smartphone, Laptop } from 'lucide-react';
import { Conversation } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onRestoreData: (conversations: Conversation[], brainData?: any) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  conversations,
  onRestoreData
}) => {
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Generate 6-digit code and push to sync endpoint
  const handleGenerateCode = async () => {
    setIsPushing(true);
    setStatusMessage(null);

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Export brain weights too
      let brainData = null;
      try {
        const brainRes = await fetch('/api/brain/export');
        if (brainRes.ok) brainData = await brainRes.json();
      } catch {}

      const payload = {
        conversations,
        brainData,
        exportedAt: Date.now()
      };

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncKey: code, data: payload })
      });

      if (res.ok) {
        setSyncCode(code);
        setStatusMessage({
          type: 'success',
          text: `Sync Key generated: ${code}. Enter this code on your phone or other device!`
        });
      } else {
        throw new Error('Sync server error');
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Could not push to cloud vault: ' + (e?.message || 'Server error') });
    } finally {
      setIsPushing(false);
    }
  };

  // Pull from sync code
  const handleRestoreFromCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsPulling(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/sync/pull/${inputCode.trim()}`);
      if (!res.ok) {
        throw new Error('Sync code not found or expired.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        const restoredConvs = json.data.conversations || [];
        const restoredBrain = json.data.brainData || null;

        onRestoreData(restoredConvs, restoredBrain);
        setStatusMessage({
          type: 'success',
          text: `Success! Restored ${restoredConvs.length} conversations & model memory.`
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sync from code' });
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopyCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download offline backup JSON
  const handleDownloadBackup = () => {
    const backup = {
      app: 'ChotuAI',
      version: '2.4',
      date: new Date().toISOString(),
      conversations
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chotuai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload offline backup JSON
  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.conversations)) {
          onRestoreData(parsed.conversations);
          setStatusMessage({
            type: 'success',
            text: `Restored ${parsed.conversations.length} conversations from file.`
          });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Invalid JSON backup file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] text-neutral-900 dark:text-neutral-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-base">Cross-Device Cloud & Offline Sync</h2>
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
        <div className="p-5 space-y-6 text-xs">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Device Sync Illustration */}
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 flex items-center justify-center gap-4 text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-sky-500" />
              <span>Laptop / PC</span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>Mobile / Tablet</span>
            </div>
          </div>

          {/* Option A: Push / Generate Sync Code */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              1. Push to Cloud Sync (Generate 6-Digit Key)
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Yeh aapke chats aur trained AI brain memory ka encrypted backup banata hai.
            </p>

            {syncCode ? (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Your Sync Key</div>
                  <div className="text-2xl font-bold font-mono tracking-widest text-indigo-600 dark:text-indigo-400">
                    {syncCode}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                disabled={isPushing}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>{isPushing ? 'Creating Sync Vault...' : 'Generate 6-Digit Sync Key'}</span>
              </button>
            )}
          </div>

          {/* Option B: Enter Sync Code to Restore */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              2. Restore from another Device
            </div>
            <form onSubmit={handleRestoreFromCode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit sync key..."
                className="flex-1 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-center tracking-widest text-sm focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isPulling || inputCode.length !== 6}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 transition-colors"
              >
                {isPulling ? 'Restoring...' : 'Sync Now'}
              </button>
            </form>
          </div>

          {/* Option C: Offline JSON Files */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              3. Offline File Backup & Restore
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadBackup}
                className="p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export File (.json)</span>
              </button>
              <label className="cursor-pointer p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-colors text-center">
                <Upload className="w-3.5 h-3.5 text-neutral-500" />
                <span>Import File (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleUploadBackup}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
