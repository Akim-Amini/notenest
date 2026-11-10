import { NoteItem } from '../types';

const STORAGE_KEY = 'quicknotes_items_v1';

// Seed data from the user screenshot attachment
export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    type: 'note',
    title: 'Mobile App Updates',
    content: 'Need to update mobile apps.\nCheck pending email replies.\nBackup important photos tonight.',
    checklist: [],
    color: 'peach',
    isPinned: true,
    isDeleted: false,
    tags: ['Work', 'Tech'],
    createdAt: Date.now() - 30 * 1000, // just now
    updatedAt: Date.now() - 30 * 1000,
  },
  {
    id: 'note-2',
    type: 'note',
    title: 'Weekend Relaxation',
    content: 'Watch a movie with friends.\nGo for shopping in market.\nTake some rest and relax.',
    checklist: [],
    color: 'amber',
    isPinned: true,
    isDeleted: false,
    tags: ['Personal', 'Weekend'],
    createdAt: Date.now() - 2 * 60 * 1000, // 2m ago
    updatedAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: 'note-3',
    type: 'note',
    title: 'Daily Routine',
    content: 'Morning walk at 7 AM.\nFinish study notes today.\nClean room before sleeping.',
    checklist: [],
    color: 'lavender',
    isPinned: false,
    isDeleted: false,
    tags: ['Habits', 'Study'],
    createdAt: Date.now() - 3 * 60 * 1000, // 3m ago
    updatedAt: Date.now() - 3 * 60 * 1000,
  },
  {
    id: 'note-4',
    type: 'list',
    title: 'Bills & Urgent Tasks',
    content: '',
    checklist: [
      { id: 'item-4-1', text: 'Pay electricity bill tomorrow', completed: false },
      { id: 'item-4-2', text: 'Upload project files tonight', completed: true },
      { id: 'item-4-3', text: 'Wake up early for workout', completed: false },
    ],
    color: 'mint',
    isPinned: false,
    isDeleted: false,
    tags: ['Bills', 'To-Do'],
    createdAt: Date.now() - 3 * 60 * 1000, // 3m ago
    updatedAt: Date.now() - 3 * 60 * 1000,
  },
  {
    id: 'note-5',
    type: 'list',
    title: 'Evening Errands',
    content: '',
    checklist: [
      { id: 'item-5-1', text: 'Buy groceries in evening', completed: true },
      { id: 'item-5-2', text: 'Complete office work before 6 PM', completed: false },
      { id: 'item-5-3', text: 'Call Rahul about the meeting', completed: false },
    ],
    color: 'rose',
    isPinned: false,
    isDeleted: false,
    tags: ['Shopping', 'Office'],
    createdAt: Date.now() - 5 * 60 * 1000, // 5m ago
    updatedAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: 'note-6',
    type: 'note',
    title: 'Team Sync & Presentation',
    content: 'Prepare presentation for Monday.\nReview app design changes.\nSend update to the team.',
    checklist: [],
    color: 'sky',
    isPinned: false,
    isDeleted: false,
    tags: ['Work', 'Meeting'],
    createdAt: Date.now() - 6 * 60 * 1000, // 6m ago
    updatedAt: Date.now() - 6 * 60 * 1000,
  },
];

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_NOTES;
  } catch (err) {
    console.warn('Failed to load notes from localStorage, using initial notes:', err);
    return INITIAL_NOTES;
  }
}

export function saveNotesToStorage(notes: NoteItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (err) {
    console.error('Failed to save notes to localStorage:', err);
    return false;
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function exportNotesAsJson(notes: NoteItem[]) {
  const jsonStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSingleNoteAsText(note: NoteItem) {
  let text = `# ${note.title || 'Untitled'}\n\n`;
  if (note.tags.length > 0) {
    text += `Tags: ${note.tags.join(', ')}\n\n`;
  }
  if (note.type === 'list') {
    text += 'Checklist:\n';
    note.checklist.forEach((item) => {
      text += `[${item.completed ? 'x' : ' '}] ${item.text}\n`;
    });
  } else {
    text += note.content;
  }
  text += `\n\n---\nLast updated: ${new Date(note.updatedAt).toLocaleString()}`;

  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (note.title || 'note').toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.download = `${safeTitle}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
