import { NoteItem } from '../types';
import { ReminderLog } from '../utils/reminders';

const REMINDER_LOG_KEY = 'notenest_reminder_log_v1';

const emptyLog = (): ReminderLog => ({ sent: {}, snoozedUntil: {} });

function normalizeLog(value: unknown): ReminderLog {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyLog();

  const raw = value as Record<string, unknown>;
  const sent: Record<string, number> = {};
  const snoozedUntil: Record<string, number> = {};

  const sourceSent =
    raw.sent && typeof raw.sent === 'object' && !Array.isArray(raw.sent)
      ? (raw.sent as Record<string, unknown>)
      : raw;
  Object.entries(sourceSent).forEach(([key, sentAt]) => {
    if (typeof sentAt === 'number' && Number.isFinite(sentAt)) sent[key] = sentAt;
  });

  if (raw.snoozedUntil && typeof raw.snoozedUntil === 'object' && !Array.isArray(raw.snoozedUntil)) {
    Object.entries(raw.snoozedUntil as Record<string, unknown>).forEach(([noteId, until]) => {
      if (typeof until === 'number' && Number.isFinite(until)) snoozedUntil[noteId] = until;
    });
  }

  return { sent, snoozedUntil };
}

export function loadReminderLog(): ReminderLog {
  try {
    const raw = localStorage.getItem(REMINDER_LOG_KEY);
    if (!raw) return emptyLog();
    return normalizeLog(JSON.parse(raw));
  } catch (error) {
    console.warn('Failed to load reminder log:', error);
    return emptyLog();
  }
}

export function saveReminderLog(log: ReminderLog): void {
  try {
    localStorage.setItem(REMINDER_LOG_KEY, JSON.stringify(log));
  } catch (error) {
    console.warn('Failed to save reminder log:', error);
  }
}

/** Drops sent entries and snoozes belonging to notes that no longer exist. */
export function pruneReminderLog(log: ReminderLog, notes: NoteItem[]): ReminderLog {
  const existingIds = new Set(notes.map((note) => note.id));
  const pruned = emptyLog();

  Object.entries(log.sent).forEach(([key, sentAt]) => {
    const noteId = key.split('|')[0];
    if (existingIds.has(noteId)) pruned.sent[key] = sentAt;
  });

  Object.entries(log.snoozedUntil).forEach(([noteId, until]) => {
    if (existingIds.has(noteId)) pruned.snoozedUntil[noteId] = until;
  });

  return pruned;
}
