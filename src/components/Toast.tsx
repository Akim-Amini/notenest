import React, { useEffect } from 'react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 text-xs font-medium animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.text}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toast.actionText && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {toast.actionText}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
