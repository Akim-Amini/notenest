import React from 'react';
import {
  Archive,
  CheckSquare,
  FileText,
  Filter,
  Heart,
  Pin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
  Download,
  Upload,
} from 'lucide-react';
import { COLOR_CONFIGS, NoteItem, PastelColor } from '../types';
import { NoteCard } from './NoteCard';

interface WorkspaceViewProps {
  notes: NoteItem[];
  onOpenCreate: (type?: 'note' | 'list') => void;
  onEditNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  onDuplicateNote: (note: NoteItem) => void;
  onExportNote: (note: NoteItem) => void;
  onExportAll: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: 'all' | 'note' | 'list' | 'pinned' | 'trash';
  setActiveFilter: (filter: 'all' | 'note' | 'list' | 'pinned' | 'trash') => void;
  selectedColor: PastelColor | null;
  setSelectedColor: (color: PastelColor | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  sortBy: 'updated' | 'created' | 'title';
  setSortBy: (sort: 'updated' | 'created' | 'title') => void;
  deletedNotesCount: number;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  notes,
  onOpenCreate,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  onToggleChecklistItem,
  onDuplicateNote,
  onExportNote,
  onExportAll,
  onImportBackup,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  selectedColor,
  setSelectedColor,
  selectedTag,
  setSelectedTag,
  sortBy,
  setSortBy,
  deletedNotesCount,
}) => {
  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      notes
        .filter((n) => !n.isDeleted)
        .flatMap((n) => n.tags || [])
    )
  );

  // Filter notes
  const filteredNotes = notes
    .filter((n) => {
      if (activeFilter === 'trash') {
        return n.isDeleted;
      }
      if (n.isDeleted) return false;

      if (activeFilter === 'pinned' && !n.isPinned) return false;
      if (activeFilter === 'note' && n.type !== 'note') return false;
      if (activeFilter === 'list' && n.type !== 'list') return false;

      if (selectedColor && n.color !== selectedColor) return false;
      if (selectedTag && !n.tags?.includes(selectedTag)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = n.title.toLowerCase().includes(q);
        const inContent = n.content.toLowerCase().includes(q);
        const inChecklist = n.checklist?.some((item) =>
          item.text.toLowerCase().includes(q)
        );
        const inTags = n.tags?.some((t) => t.toLowerCase().includes(q));
        return inTitle || inContent || inChecklist || inTags;
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned notes always on top if in 'all' view
      if (activeFilter === 'all' && a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      }
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const activeCount = notes.filter((n) => !n.isDeleted).length;
  const pinnedCount = notes.filter((n) => !n.isDeleted && n.isPinned).length;
  const noteTypeCount = notes.filter((n) => !n.isDeleted && n.type === 'note').length;
  const listTypeCount = notes.filter((n) => !n.isDeleted && n.type === 'list').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Quick Create Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onOpenCreate('note')}
              className="w-full h-11 px-4 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Take New Note</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCreate('list')}
              className="w-full h-11 px-4 rounded-2xl bg-white hover:bg-slate-50 text-indigo-950 border border-slate-200 font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Take New Checklist</span>
            </button>
          </div>

          {/* Navigation Categories */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Categories
            </h4>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setSelectedColor(null);
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeFilter === 'all' && !selectedColor && !selectedTag
                  ? 'bg-indigo-50 text-indigo-950'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📚</span>
                <span>All Notes</span>
              </div>
              <span className="text-slate-400 font-normal">{activeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('pinned');
                setSelectedColor(null);
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeFilter === 'pinned'
                  ? 'bg-rose-50 text-rose-950'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pin className="w-4 h-4 text-rose-500 fill-rose-500 rotate-45" />
                <span>Pinned Notes</span>
              </div>
              <span className="text-slate-400 font-normal">{pinnedCount}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('note');
                setSelectedColor(null);
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeFilter === 'note'
                  ? 'bg-indigo-50 text-indigo-950'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Text Notes</span>
              </div>
              <span className="text-slate-400 font-normal">{noteTypeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('list');
                setSelectedColor(null);
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeFilter === 'list'
                  ? 'bg-emerald-50 text-emerald-950'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Checklists</span>
              </div>
              <span className="text-slate-400 font-normal">{listTypeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('trash');
                setSelectedColor(null);
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeFilter === 'trash'
                  ? 'bg-rose-50 text-rose-950'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Trash</span>
              </div>
              <span className="text-slate-400 font-normal">{deletedNotesCount}</span>
            </button>
          </div>

          {/* Color Palettes Filter */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Filter by Color
              </h4>
              {selectedColor && (
                <button
                  type="button"
                  onClick={() => setSelectedColor(null)}
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {(Object.keys(COLOR_CONFIGS) as PastelColor[]).map((cKey) => {
                const conf = COLOR_CONFIGS[cKey];
                const isSelected = selectedColor === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() =>
                      setSelectedColor(isSelected ? null : cKey)
                    }
                    title={conf.name}
                    className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-slate-900 scale-105 shadow-xs'
                        : 'hover:scale-102 border-slate-200'
                    }`}
                    style={{ backgroundColor: conf.swatchHex }}
                  >
                    <span className="text-[9px] font-bold text-slate-700/80">
                      {conf.name.split(' ')[1] || conf.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Tags
                </h4>
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-indigo-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Backup & Data Actions */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Data & Storage
            </h4>
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={onExportAll}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Search & Filter Bar */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, checklists, tags..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Quick Filter Chips */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'item' : 'items'}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'updated' | 'created' | 'title')
                  }
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Capture Input Banner */}
          <div
            onClick={() => onOpenCreate('note')}
            className="group cursor-pointer bg-gradient-to-r from-[#EEF2E8] via-[#FAF7F0] to-[#F3EDE0] border border-indigo-100/80 rounded-3xl p-4 flex items-center justify-between shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-950">
                  Take a note or checklist...
                </p>
                <p className="text-xs text-slate-500">
                  Click here to quickly capture your thoughts in pastel cards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreate('list');
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-indigo-950 border border-indigo-100 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors hidden sm:flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>New Checklist</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No notes found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No notes match your search "${searchQuery}". Try different keywords.`
                  : activeFilter === 'trash'
                  ? 'The trash is currently empty.'
                  : 'Start capturing your notes and lists easily!'}
              </p>
              <button
                type="button"
                onClick={() => onOpenCreate('note')}
                className="mt-5 px-5 py-2.5 rounded-2xl bg-indigo-950 text-white text-xs font-bold shadow-sm hover:bg-indigo-900 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Note</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pinned Notes Section (if activeFilter is 'all' and there are pinned notes) */}
              {activeFilter === 'all' && pinnedNotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-rose-500 fill-rose-500 rotate-45" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pinned ({pinnedNotes.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={onEditNote}
                        onDelete={onDeleteNote}
                        onTogglePin={onTogglePin}
                        onToggleChecklistItem={onToggleChecklistItem}
                        onDuplicate={onDuplicateNote}
                        onExportSingle={onExportNote}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Notes Section */}
              <div className="space-y-3">
                {activeFilter === 'all' && pinnedNotes.length > 0 && (
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Other Notes ({otherNotes.length})
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(activeFilter === 'all' && pinnedNotes.length > 0
                    ? otherNotes
                    : filteredNotes
                  ).map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={onEditNote}
                      onDelete={onDeleteNote}
                      onTogglePin={onTogglePin}
                      onToggleChecklistItem={onToggleChecklistItem}
                      onDuplicate={onDuplicateNote}
                      onExportSingle={onExportNote}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
