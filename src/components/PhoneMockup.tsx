import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Edit3,
  Heart,
  Mail,
  Pin,
  Plus,
  Search,
  Trash2,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { NoteItem } from '../types';
import { NoteCard } from './NoteCard';

interface PhoneMockupProps {
  notes: NoteItem[];
  onOpenCreate: (type?: 'note' | 'list') => void;
  onEditNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  onDuplicateNote: (note: NoteItem) => void;
  onExportNote: (note: NoteItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: 'all' | 'note' | 'list' | 'pinned';
  setActiveFilter: (filter: 'all' | 'note' | 'list' | 'pinned') => void;
  onOpenProfile: () => void;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  notes,
  onOpenCreate,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  onToggleChecklistItem,
  onDuplicateNote,
  onExportNote,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onOpenProfile,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  // Filter notes for the phone screen
  const filteredNotes = notes.filter((n) => {
    if (n.isDeleted) return false;
    if (activeFilter === 'pinned' && !n.isPinned) return false;
    if (activeFilter === 'note' && n.type !== 'note') return false;
    if (activeFilter === 'list' && n.type !== 'list') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = n.title.toLowerCase().includes(q);
      const inContent = n.content.toLowerCase().includes(q);
      const inChecklist = n.checklist?.some((item) =>
        item.text.toLowerCase().includes(q)
      );
      const inTags = n.tags?.some((tag) => tag.toLowerCase().includes(q));
      return inTitle || inContent || inChecklist || inTags;
    }
    return true;
  });

  return (
    <div className="phone-preview-shell flex flex-col items-center justify-center py-6 px-3 w-full max-w-xl mx-auto">
      {/* Top Banner section matching Screenshot */}
      <div className="phone-preview-promo text-center mb-6 max-w-md">
        <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-950 tracking-tight mb-2">
          NoteNest
        </h1>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          Create, edit, pin, and manage your notes easily.
          <br />
          All your important thoughts in beautiful cards.
        </p>

        {/* 4 Feature highlight badges matching Screenshot */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-1">
          <button
            type="button"
            onClick={() => onOpenCreate('note')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:shadow-md transition-all">
              <Edit3 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-2">
              Create Notes
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveFilter(activeFilter === 'pinned' ? 'all' : 'pinned')
            }
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center transition-all group-hover:scale-105 ${
                activeFilter === 'pinned'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white border-indigo-100 text-indigo-600 group-hover:shadow-md'
              }`}
            >
              <Pin className="w-5 h-5 rotate-45 fill-current" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-2">
              Pin Important
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (notes.length > 0) onEditNote(notes[0]);
              else onOpenCreate();
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:shadow-md transition-all">
              <Edit3 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-2">
              Edit Anytime
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:shadow-md transition-all">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-2">
              Delete Notes
            </span>
          </button>
        </div>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="phone-device-frame relative w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[50px] p-3 shadow-2xl ring-12 ring-slate-800/80">
        {/* Dynamic Island / Notch */}
        <div className="phone-device-notch absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-end pr-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/90 border border-slate-800" />
        </div>

        {/* Inner Phone Screen */}
        <div className="phone-device-screen relative w-full h-full bg-[#FAF7F0] rounded-[42px] overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="phone-fake-status pt-3.5 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-900 select-none z-30">
            <span>9:30</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              {/* Cellular Signal Icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="16" width="3" height="6" rx="1" />
                <rect x="7" y="12" width="3" height="10" rx="1" />
                <rect x="12" y="8" width="3" height="14" rx="1" />
                <rect x="17" y="4" width="3" height="18" rx="1" />
              </svg>
              {/* Wifi Icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
              </svg>
              {/* Battery Icon */}
              <div className="w-5 h-2.5 border border-slate-900 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-900 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Top Bar matching Screenshot */}
          <div className="phone-app-header px-5 pt-2 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h2 className="text-lg font-bold text-indigo-950 tracking-tight">
                NoteNest
              </h2>
            </div>

            {/* Top Right Action Icons matching Screenshot: Search, Mail/Heart, Profile */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={`phone-header-action w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  showSearch
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-900'
                }`}
                title="Search notes"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Favorites / Pinned Filter Button */}
              <button
                type="button"
                onClick={() =>
                  setActiveFilter(activeFilter === 'pinned' ? 'all' : 'pinned')
                }
                className={`phone-header-action w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  activeFilter === 'pinned'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-indigo-100/80 hover:bg-indigo-200/80 text-rose-600'
                }`}
                title="Filter pinned notes"
              >
                <Heart className={`w-4 h-4 ${activeFilter === 'pinned' ? 'fill-current' : ''}`} />
              </button>

              {/* Profile / Stats Button */}
              <button
                type="button"
                onClick={onOpenProfile}
                className="phone-header-action w-8 h-8 rounded-xl bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-900 flex items-center justify-center transition-all"
                title="Note stats & backups"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {showSearch && (
            <div className="px-4 pb-2 animate-in fade-in duration-150">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes & lists..."
                  className="phone-search-input w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="phone-search-clear absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Filter Tabs inside Mobile View */}
          <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'pinned', label: '📌 Pinned' },
                { id: 'note', label: '📝 Notes' },
                { id: 'list', label: '☑️ Lists' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`phone-filter-tab px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-indigo-950 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Note Cards Grid (2 Columns, matching Screenshot) */}
          <div className="phone-note-list flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-20">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 mb-2">
                  <Edit3 className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notes found</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  {searchQuery
                    ? `No notes match "${searchQuery}"`
                    : 'Tap the (+) button below to create your first note or list!'}
                </p>
              </div>
            ) : (
              <div className="phone-note-grid grid grid-cols-2 gap-2.5 items-start">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    onDelete={onDeleteNote}
                    onTogglePin={onTogglePin}
                    onToggleChecklistItem={onToggleChecklistItem}
                    onDuplicate={onDuplicateNote}
                    onExportSingle={onExportNote}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating Action Button (+) centered at bottom matching screenshot */}
          <div className="phone-new-note absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            <button
              type="button"
              onClick={() => onOpenCreate('note')}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#FF5533] text-white flex items-center justify-center shadow-lg shadow-orange-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Create new note or list"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* iPhone Home Swipe Indicator Bar */}
          <div className="phone-home-indicator absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/30 rounded-full z-40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
