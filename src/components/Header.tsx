import React from 'react';
import { LayoutGrid, Moon, Plus, Smartphone, Sun } from 'lucide-react';

interface HeaderProps {
  viewMode: 'mockup' | 'workspace';
  setViewMode: (mode: 'mockup' | 'workspace') => void;
  onOpenCreate: (type?: 'note' | 'list') => void;
  totalNotes: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenCreate,
  totalNotes,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#6B8F71] backdrop-blur-md border-b border-[#55795B] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8 transition-colors shadow-sm">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-2xl">📚</span>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#111811] whitespace-nowrap">
            NoteNest
          </span>
          <span className="text-[10px] text-[#111811] font-medium hidden sm:inline">
            {totalNotes} {totalNotes === 1 ? 'note' : 'notes'} saved
          </span>
        </div>
      </div>

      {/* Zone 2: Clean single-line navigation / View Toggle */}
      <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-[#55795B] rounded-2xl shrink-0">
        <button
          type="button"
          onClick={() => setViewMode('mockup')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            viewMode === 'mockup'
              ? 'bg-[#FAF7F0] text-[#292D29] shadow-xs'
              : 'text-white hover:text-[#FAF7F0]'
          }`}
          title="Mobile Showcase matching screenshot"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#263329]" />
          <span className="hidden sm:inline">Mobile Preview</span>
          <span className="sm:hidden">Mobile</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('workspace')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            viewMode === 'workspace'
              ? 'bg-[#FAF7F0] text-[#292D29] shadow-xs'
              : 'text-white hover:text-[#FAF7F0]'
          }`}
          title="Expanded Desktop Workspace"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#263329]" />
          <span className="hidden sm:inline">Workspace</span>
          <span className="sm:hidden">Workspace</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          aria-pressed={isDarkMode}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          className="w-9 h-9 rounded-xl border border-[#55795B] bg-[#FAF7F0] text-[#263329] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors app-theme-toggle shadow-sm"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => onOpenCreate('note')}
          className="px-3.5 sm:px-4 py-2 text-xs font-bold text-[#111811] bg-[#6B8F71] hover:bg-[#55795B] rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
};
