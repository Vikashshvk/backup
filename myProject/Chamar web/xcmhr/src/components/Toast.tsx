import React from 'react';
import { useCommunity } from '../context/CommunityContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCommunity();

  if (!toasts.length) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        let bgColor = 'bg-blue-900 text-white border-blue-700';
        let Icon = Info;
        if (toast.type === 'success') {
          bgColor = 'bg-blue-600 text-white border-blue-500';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-600 text-white border-red-500';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-600 text-white border-amber-500';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgColor}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
