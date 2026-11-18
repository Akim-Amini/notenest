import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  CheckCircle2,
  CheckSquare,
  FileText,
  Pin,
  Plus,
  Trash2,
  X,
  Tag,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ChecklistItem,
  COLOR_CONFIGS,
  DEFAULT_NOTE_KIND,
  DEFAULT_PRIORITY,
  DEFAULT_REMINDER_OFFSETS,
  isScheduledKind,
  NoteItem,
  NoteKind,
  NoteType,
  PastelColor,
  PRIORITIES,
  Priority,
  REMINDER_OPTIONS,
} from '../types';

interface NoteEditorModalProps {
  isOpen: boolean;
  initialNote?: NoteItem | null;
  onClose: () => void;
  onSave: (noteData: Partial<NoteItem>) => void;
  onDelete?: (id: string) => void;
}

const KIND_OPTIONS: { value: NoteKind; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'event', label: 'Event' },
];

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function toDateTimeLocalValue(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function toIsoString(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  initialNote,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<NoteType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [color, setColor] = useState<PastelColor>('peach');
  const [isPinned, setIsPinned] = useState(false);
  const [kind, setKind] = useState<NoteKind>(DEFAULT_NOTE_KIND);
  const [dueAt, setDueAt] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [eventLocation, setEventLocation] = useState('');
  const [completed, setCompleted] = useState(false);
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([
    ...DEFAULT_REMINDER_OFFSETS,
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [hasSaved, setHasSaved] = useState(false);
  const [validationError, setValidationError] = useState('');

  const newChecklistInputRef = useRef<HTMLInputElement>(null);

  const handleEditorFieldFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = event.currentTarget;
    window.setTimeout(() => {
      field.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 300);
  };

  useEffect(() => {
    if (initialNote) {
      setType(initialNote.type || 'note');
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setChecklist(initialNote.checklist ? [...initialNote.checklist] : []);
      setColor(initialNote.color || 'peach');
      setIsPinned(Boolean(initialNote.isPinned));
      setKind(initialNote.kind || DEFAULT_NOTE_KIND);
      setDueAt(toDateTimeLocalValue(initialNote.dueAt));
      setSubject(initialNote.subject || '');
      setPriority(initialNote.priority || DEFAULT_PRIORITY);
      setEventLocation(initialNote.eventLocation || '');
      setCompleted(Boolean(initialNote.completed));
      setReminderOffsets(
        Array.isArray(initialNote.reminderOffsets)
          ? [...initialNote.reminderOffsets]
          : [...DEFAULT_REMINDER_OFFSETS]
      );
      setTags(initialNote.tags ? [...initialNote.tags] : []);
    } else {
      setType('note');
      setTitle('');
      setContent('');
      setChecklist([]);
      setColor('peach');
      setIsPinned(false);
      setKind(DEFAULT_NOTE_KIND);
      setDueAt('');
      setSubject('');
      setPriority(DEFAULT_PRIORITY);
      setEventLocation('');
      setCompleted(false);
      setReminderOffsets([...DEFAULT_REMINDER_OFFSETS]);
      setTags([]);
    }
    setNewChecklistText('');
    setNewTagInput('');
    setHasSaved(false);
    setValidationError('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  // Handle switching between Note and List formats
  const handleTypeSwitch = (nextType: NoteType) => {
    if (nextType === type) return;

    if (nextType === 'list') {
      // Convert content lines to checklist
      const lines = content
        .split('\n')
        .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
        .filter((l) => l.length > 0);

      const converted: ChecklistItem[] = lines.map((text, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        text,
        completed: false,
      }));
      setChecklist(converted.length > 0 ? converted : [{ id: `item-${Date.now()}`, text: '', completed: false }]);
      setType('list');
    } else {
      // Convert checklist items to text content
      const text = checklist
        .map((item) => (item.completed ? `✓ ${item.text}` : `• ${item.text}`))
        .join('\n');
      setContent(text);
      setType('note');
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
    newChecklistInputRef.current?.focus();
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleUpdateCheckItemText = (id: string, text: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKindChange = (nextKind: NoteKind) => {
    setKind(nextKind);
    setValidationError('');
  };

  const handleToggleReminder = (minutes: number) => {
    setReminderOffsets((current) =>
      current.includes(minutes)
        ? current.filter((value) => value !== minutes)
        : [...current, minutes].sort((a, b) => b - a)
    );
  };

  const handleSave = () => {
    const isoDueAt = isScheduledKind(kind) ? toIsoString(dueAt) : undefined;
    if (isScheduledKind(kind) && !isoDueAt) {
      setValidationError(
        kind === 'event'
          ? 'Please choose the date and time of the event.'
          : 'Please choose when this assignment is due.'
      );
      return;
    }

    // If user has pending text in the checklist input, add it before saving
    let finalChecklist = [...checklist];
    if (type === 'list' && newChecklistText.trim()) {
      finalChecklist.push({
        id: `item-${Date.now()}`,
        text: newChecklistText.trim(),
        completed: false,
      });
      setNewChecklistText('');
    }

    // Filter out empty items
    finalChecklist = finalChecklist.filter((item) => item.text.trim().length > 0);

    onSave({
      id: initialNote?.id,
      type,
      title: title.trim() || (type === 'list' ? 'Untitled Checklist' : 'Untitled Note'),
      content: content.trim(),
      checklist: finalChecklist,
      color,
      isPinned,
      tags,
      isDeleted: false,
      kind,
      dueAt: isoDueAt,
      subject: subject.trim(),
      priority,
      eventLocation: eventLocation.trim(),
      completed,
      reminderOffsets: [...reminderOffsets],
    });
    setHasSaved(true);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const currentColor = COLOR_CONFIGS[color] || COLOR_CONFIGS.peach;
  const colorKeys = Object.keys(COLOR_CONFIGS) as PastelColor[];
  const fieldClass =
    'w-full min-w-0 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-black/10 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800';

  return (
    <div className="note-editor-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`note-editor-panel w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl ${currentColor.bgGradient} border-2 ${currentColor.cardBorder} shadow-2xl overflow-hidden transition-colors duration-300`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-black/6">
          {/* Format Selector: Note vs Checklist */}
          <div className="flex items-center p-1 bg-white/70 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => handleTypeSwitch('note')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'note'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Note
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Checklist
            </button>
          </div>

          {/* Quick Actions: Pin, Delete, Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
                isPinned
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white/80 hover:bg-white text-slate-700'
              }`}
              title={isPinned ? 'Pinned note' : 'Pin note'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-white' : ''} rotate-45`} />
              <span>{isPinned ? 'Pinned' : 'Pin'}</span>
            </button>

            {initialNote && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialNote.id);
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 flex items-center justify-center transition-colors"
              title="Close without saving"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Kind Selector */}
          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Kind
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/70 rounded-2xl shadow-xs">
              {KIND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleKindChange(option.value)}
                  aria-pressed={kind === option.value}
                  className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold transition-all ${
                    kind === option.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleEditorFieldFocus}
              placeholder="Title..."
              className={`w-full text-xl md:text-2xl font-bold bg-transparent placeholder-slate-400 focus:outline-none ${currentColor.textPrimary}`}
              autoFocus={!initialNote}
            />
          </div>

          {/* Scheduling fields for assignments and events */}
          {isScheduledKind(kind) && (
            <div className="space-y-3 p-3 md:p-4 rounded-2xl bg-white/60 border border-black/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="note-due-at"
                    className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
                  >
                    Due date &amp; time <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="note-due-at"
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => {
                      setDueAt(e.target.value);
                      setValidationError('');
                    }}
                    onFocus={handleEditorFieldFocus}
                    required
                    aria-required="true"
                    className={fieldClass}
                    style={{ colorScheme: 'light' }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="note-subject"
                    className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="note-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onFocus={handleEditorFieldFocus}
                    placeholder="e.g. Biology, Project..."
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Priority
                  </span>
                  <div className="flex gap-1.5 p-1 bg-white/70 rounded-xl">
                    {PRIORITIES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPriority(option)}
                        aria-pressed={priority === option}
                        className={`flex-1 min-h-[44px] rounded-lg text-xs font-semibold transition-all ${
                          priority === option
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-white/80'
                        }`}
                      >
                        {PRIORITY_LABELS[option]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompleted((current) => !current)}
                  aria-pressed={completed}
                  className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    completed
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white/80 text-slate-700 border-black/10 hover:bg-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completed ? 'Done' : 'Mark as done'}
                </button>
              </div>

              {kind === 'event' && (
                <div>
                  <label
                    htmlFor="note-location"
                    className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5"
                  >
                    Location
                  </label>
                  <input
                    id="note-location"
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    onFocus={handleEditorFieldFocus}
                    placeholder="Where is it happening?"
                    className={fieldClass}
                  />
                </div>
              )}

              <div>
                <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Reminders
                </span>
                <div className="flex flex-wrap gap-2">
                  {REMINDER_OPTIONS.map((option) => {
                    const checked = reminderOffsets.includes(option.minutes);
                    return (
                      <label
                        key={option.minutes}
                        className={`inline-flex items-center gap-2 min-h-[44px] px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          checked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white/80 text-slate-700 border-black/10 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleReminder(option.minutes)}
                          className="w-4 h-4 accent-slate-900"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {validationError && (
                <p
                  role="alert"
                  className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2"
                >
                  {validationError}
                </p>
              )}
            </div>
          )}

          {/* Note Mode: Textarea */}
          {type === 'note' && (
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleEditorFieldFocus}
                placeholder="Take a note... You can write paragraphs, quick thoughts, meeting notes or ideas."
                rows={7}
                className={`w-full bg-transparent focus:outline-none resize-none text-sm md:text-base leading-relaxed placeholder-slate-400 ${currentColor.textPrimary}`}
              />

              <div className="flex items-center gap-2 pt-1 border-t border-black/6 text-xs text-slate-500">
                <span>{content.length} characters</span>
                <span>·</span>
                <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
              </div>
            </div>
          )}

          {/* List Mode: Interactive Checklist Editor */}
          {type === 'list' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 pb-1">
                <span>
                  {checklist.filter((i) => i.completed).length} of {checklist.length} items
                  completed
                </span>
                {checklist.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist(
                        checklist.map((item) => ({ ...item, completed: true }))
                      )
                    }
                    className="text-xs text-indigo-700 hover:underline"
                  >
                    Mark all done
                  </button>
                )}
              </div>

              {/* Checklist items list */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 group/item bg-white/60 hover:bg-white/90 p-2 rounded-xl transition-all border border-black/5"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCheckItem(item.id)}
                      className="shrink-0 text-slate-700 hover:text-slate-900"
                    >
                      {item.completed ? (
                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-400 hover:border-slate-600 bg-white" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateCheckItemText(item.id, e.target.value)}
                      onFocus={handleEditorFieldFocus}
                      placeholder="Task item..."
                      className={`flex-1 text-xs md:text-sm bg-transparent focus:outline-none ${
                        item.completed
                          ? 'line-through text-slate-400'
                          : currentColor.textPrimary
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(item.id)}
                      className="opacity-40 group-hover/item:opacity-100 hover:text-rose-600 p-1 text-slate-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new checklist item input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  ref={newChecklistInputRef}
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onFocus={handleEditorFieldFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="+ Add list item (press Enter)..."
                  className="flex-1 px-3 py-2 text-xs md:text-sm bg-white/80 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-800 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Color Palette Swatches */}
          <div className="pt-2 border-t border-black/6">
            <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
              Card Color
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {colorKeys.map((cKey) => {
                const conf = COLOR_CONFIGS[cKey];
                const isSelected = color === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => setColor(cKey)}
                    title={conf.name}
                    className={`relative w-8 h-8 rounded-full border-2 transition-transform active:scale-95 shrink-0 flex items-center justify-center ${
                      isSelected
                        ? 'border-slate-900 scale-110 shadow-md ring-2 ring-white'
                        : 'border-white/80 hover:scale-105'
                    }`}
                    style={{ backgroundColor: conf.swatchHex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-800 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Section */}
          <div className="pt-2 border-t border-black/6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags
              </label>
              {/* Quick suggestion tags */}
              <div className="flex items-center gap-1 text-[10px]">
                {['Work', 'Personal', 'To-Do', 'Ideas'].map((quickTag) => (
                  <button
                    key={quickTag}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(quickTag)) setTags([...tags, quickTag]);
                    }}
                    className="px-1.5 py-0.5 rounded-md bg-white/60 hover:bg-white text-slate-600 font-medium transition-colors"
                  >
                    +{quickTag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onFocus={handleEditorFieldFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ Add tag..."
                  className="px-2 py-1 text-xs bg-white/60 rounded-lg border border-black/10 focus:outline-none focus:bg-white w-24"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-5 py-3.5 bg-white/80 border-t border-black/8 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Auto-saves to browser</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md shadow-slate-900/10 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save {type === 'list' ? 'List' : 'Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
