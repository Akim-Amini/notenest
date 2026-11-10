import React from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HardDrive,
  Pin,
  RefreshCw,
  Upload,
  User,
  X,
} from 'lucide-react';
import { NoteItem } from '../types';

interface StatsProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onExportAll: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSeedData: () => void;
}

export const StatsProfileModal: React.FC<StatsProfileModalProps> = ({
  isOpen,
  onClose,
  notes,
  onExportAll,
  onImportBackup,
  onResetSeedData,
}) => {
  if (!isOpen) return null;

  const activeNotes = notes.filter((n) => !n.isDeleted);
  const textNotes = activeNotes.filter((n) => n.type === 'note');
  const checklists = activeNotes.filter((n) => n.type === 'list');
  const pinnedNotes = activeNotes.filter((n) => n.isPinned);

  const totalTasks = checklists.reduce((acc, c) => acc + (c.checklist?.length || 0), 0);
  const completedTasks = checklists.reduce(
    (acc, c) => acc + (c.checklist?.filter((i) => i.completed).length || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">NoteNest Profile</h3>
              <p className="text-[11px] text-slate-500">Local storage & Statistics</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/60">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Total Notes
              </span>
              <span className="text-2xl font-extrabold text-indigo-950">
                {activeNotes.length}
              </span>
              <span className="text-[10px] text-indigo-600/70 block mt-0.5">
                {textNotes.length} notes · {checklists.length} lists
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100/60">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Pinned
              </span>
              <span className="text-2xl font-extrabold text-rose-950">
                {pinnedNotes.length}
              </span>
              <span className="text-[10px] text-rose-600/70 block mt-0.5">
                High priority cards
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/60 col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Checklist Progress
                </span>
                <span className="text-lg font-bold text-emerald-950">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Backup & Save Management */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Data Management & Backup
            </h4>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onExportAll}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Download Backup (.json)</span>
                </div>
                <span className="text-[10px] text-slate-400">Save all notes offline</span>
              </button>

              <label className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Import Backup (.json)</span>
                </div>
                <span className="text-[10px] text-slate-400">Restore file</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    onImportBackup(e);
                    onClose();
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset notes to the 6 sample cards from the design screenshot?')) {
                    onResetSeedData();
                    onClose();
                  }
                }}
                className="w-full py-2 px-3.5 rounded-xl hover:bg-amber-50 text-xs font-semibold text-amber-700 flex items-center gap-2 transition-colors text-left"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to screenshot sample notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
