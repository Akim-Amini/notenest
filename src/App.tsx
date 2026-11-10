import React, { useState, useEffect, useCallback } from 'react';
import { NoteItem, PastelColor } from './types';
import {
  exportNotesAsJson,
  exportSingleNoteAsText,
  INITIAL_NOTES,
  loadNotes,
  saveNotesToStorage,
} from './services/storage';
import { Header } from './components/Header';
import { PhoneMockup } from './components/PhoneMockup';
import { WorkspaceView } from './components/WorkspaceView';
import { NoteEditorModal } from './components/NoteEditorModal';
import { StatsProfileModal } from './components/StatsProfileModal';
import { Toast, ToastMessage } from './components/Toast';

const THEME_STORAGE_KEY = 'notes-and-lists-theme';

export default function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch (error) {
      console.warn('Failed to load theme preference from localStorage:', error);
      return false;
    }
  });
  const [viewMode, setViewMode] = useState<'mockup' | 'workspace'>('mockup');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'note' | 'list' | 'pinned' | 'trash'>('all');
  const [selectedColor, setSelectedColor] = useState<PastelColor | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, actionText?: string, onAction?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, actionText, onAction }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference to localStorage:', error);
    }
  }, [isDarkMode]);

  // Sync to localStorage
  const updateNotesAndPersist = useCallback(
    (newNotes: NoteItem[]) => {
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    },
    []
  );

  // Open editor for new note or checklist
  const handleOpenCreate = (forcedType?: 'note' | 'list') => {
    setEditingNote(
      forcedType
        ? {
            id: '',
            type: forcedType,
            title: '',
            content: '',
            checklist: [],
            color: 'peach',
            isPinned: false,
            isDeleted: false,
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        : null
    );
    setIsEditorOpen(true);
  };

  // Open editor for existing note
  const handleEditNote = (note: NoteItem) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  // Save note from editor
  const handleSaveNote = (noteData: Partial<NoteItem>) => {
    const now = Date.now();
    if (noteData.id) {
      // Edit existing note
      const updated = notes.map((n) =>
        n.id === noteData.id
          ? ({
              ...n,
              ...noteData,
              updatedAt: now,
            } as NoteItem)
          : n
      );
      updateNotesAndPersist(updated);
      addToast(
        noteData.type === 'list'
          ? 'Checklist updated successfully'
          : 'Note updated successfully'
      );
    } else {
      // Create new note
      const newNote: NoteItem = {
        id: `note-${now}-${Math.random().toString(36).substr(2, 5)}`,
        type: noteData.type || 'note',
        title: noteData.title || (noteData.type === 'list' ? 'Untitled Checklist' : 'Untitled Note'),
        content: noteData.content || '',
        checklist: noteData.checklist || [],
        color: noteData.color || 'peach',
        isPinned: Boolean(noteData.isPinned),
        isDeleted: false,
        tags: noteData.tags || [],
        createdAt: now,
        updatedAt: now,
      };
      updateNotesAndPersist([newNote, ...notes]);
      addToast(
        newNote.type === 'list'
          ? 'Checklist saved successfully'
          : 'Note saved successfully'
      );
    }
  };

  // Delete note with Undo support
  const handleDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    // Soft delete to allow undo
    const updated = notes.map((n) => (n.id === id ? { ...n, isDeleted: true } : n));
    updateNotesAndPersist(updated);

    addToast('Note moved to trash', 'Undo', () => {
      // Undo restoration
      setNotes((current) => {
        const restored = current.map((n) =>
          n.id === id ? { ...n, isDeleted: false } : n
        );
        saveNotesToStorage(restored);
        return restored;
      });
    });
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    const target = notes.find((n) => n.id === id);
    const newPinned = !target?.isPinned;
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isPinned: newPinned, updatedAt: Date.now() } : n
    );
    updateNotesAndPersist(updated);
    addToast(newPinned ? 'Note pinned to top' : 'Note unpinned');
  };

  // Toggle item in checklist directly from the card
  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    const updated = notes.map((n) => {
      if (n.id !== noteId) return n;
      const updatedChecklist = n.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return {
        ...n,
        checklist: updatedChecklist,
        updatedAt: Date.now(),
      };
    });
    updateNotesAndPersist(updated);
  };

  // Duplicate a note
  const handleDuplicateNote = (note: NoteItem) => {
    const copy: NoteItem = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `${note.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateNotesAndPersist([copy, ...notes]);
    addToast('Note duplicated');
  };

  // Export single note as markdown file
  const handleExportSingleNote = (note: NoteItem) => {
    exportSingleNoteAsText(note);
    addToast('Note exported as markdown');
  };

  // Export all notes as JSON
  const handleExportAll = () => {
    exportNotesAsJson(notes);
    addToast('All notes exported to JSON backup');
  };

  // Import backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          updateNotesAndPersist(parsed);
          addToast(`Restored ${parsed.length} notes from backup`);
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Could not read backup file.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Reset to initial seed notes matching screenshot
  const handleResetSeedData = () => {
    updateNotesAndPersist(INITIAL_NOTES);
    addToast('Reset to original sample cards');
  };

  const activeNotesCount = notes.filter((n) => !n.isDeleted).length;
  const deletedNotesCount = notes.filter((n) => n.isDeleted).length;

  return (
    <div
      className={`app-shell min-h-screen bg-[#FAF7F0] flex flex-col selection:bg-[#DCE8D9] selection:text-[#292D29] font-sans text-[#292D29] ${
        isDarkMode ? 'app-dark' : ''
      }`}
    >
      {/* Top Navigation Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCreate={handleOpenCreate}
        totalNotes={activeNotesCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((current) => !current)}
      />

      {/* Main View Mode Content */}
      <main className="flex-1 flex flex-col justify-start">
        {viewMode === 'mockup' ? (
          <PhoneMockup
            notes={notes}
            onOpenCreate={handleOpenCreate}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleChecklistItem={handleToggleChecklistItem}
            onDuplicateNote={handleDuplicateNote}
            onExportNote={handleExportSingleNote}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter === 'trash' ? 'all' : activeFilter}
            setActiveFilter={(f) => setActiveFilter(f)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        ) : (
          <WorkspaceView
            notes={notes}
            onOpenCreate={handleOpenCreate}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleChecklistItem={handleToggleChecklistItem}
            onDuplicateNote={handleDuplicateNote}
            onExportNote={handleExportSingleNote}
            onExportAll={handleExportAll}
            onImportBackup={handleImportBackup}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            sortBy={sortBy}
            setSortBy={setSortBy}
            deletedNotesCount={deletedNotesCount}
          />
        )}
      </main>

      {/* Note / Checklist Editor Modal */}
      <NoteEditorModal
        isOpen={isEditorOpen}
        initialNote={editingNote}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {/* Profile, Backup & Stats Modal */}
      <StatsProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        notes={notes}
        onExportAll={handleExportAll}
        onImportBackup={handleImportBackup}
        onResetSeedData={handleResetSeedData}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <footer className="w-full py-4 text-center text-xs text-slate-500">
        Built by Akim Amini
      </footer>
    </div>
  );
}
