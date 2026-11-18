import { formatReminderOffset, NoteItem } from '../types';
import { getDueTimestamp, isUpcomingNote } from './upcoming';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MINUTE_MS = 60 * 1000;

export interface ReminderLog {
  sent: Record<string, number>;
  snoozedUntil: Record<string, number>;
}

export type ReminderType = 'offset' | 'due-now' | 'overdue' | 'daily' | 'snooze';

export interface DueReminder {
  key: string;
  noteId: string;
  noteTitle: string;
  dueAt: string;
  type: ReminderType;
  label: string;
  message: string;
  fireAt: number;
}

export type ReminderPermission = 'enabled' | 'blocked' | 'unsupported' | 'not-enabled';

export interface ReminderBannerData {
  title: string;
  details: string[];
}

export function makeReminderKey(noteId: string, reminderType: string, dueAt: string): string {
  return `${noteId}|${reminderType}|${dueAt}`;
}

export function getSnoozedUntil(log: ReminderLog, noteId: string): number | null {
  const until = log.snoozedUntil[noteId];
  return typeof until === 'number' && Number.isFinite(until) ? until : null;
}

export function setSnoozedUntil(log: ReminderLog, noteId: string, until: number): ReminderLog {
  return {
    sent: log.sent,
    snoozedUntil: { ...log.snoozedUntil, [noteId]: until },
  };
}

export function clearSnoozedUntil(log: ReminderLog, noteId: string): ReminderLog {
  const snoozedUntil = { ...log.snoozedUntil };
  delete snoozedUntil[noteId];
  return { sent: log.sent, snoozedUntil };
}

function nounFor(note: NoteItem): string {
  return note.kind === 'event' ? 'Event' : 'Assignment';
}

/**
 * Pure: given notes, "now" and the already-sent log, work out which reminders
 * are due. Nothing here touches localStorage, timers or the Notification API.
 */
export function getDueReminders(
  notes: NoteItem[],
  now: number,
  sentLog: ReminderLog
): DueReminder[] {
  const due: DueReminder[] = [];
  const seen = new Set<string>();

  notes.forEach((note) => {
    if (!isUpcomingNote(note)) return;

    const dueAt = note.dueAt as string;
    const dueTime = getDueTimestamp(note) as number;
    const title = note.title || `${nounFor(note)} without a title`;
    const noun = nounFor(note);

    const snoozedUntil = getSnoozedUntil(sentLog, note.id);
    if (snoozedUntil !== null) {
      // While snoozed, skip every normal reminder. When the snooze ends, fire
      // exactly one reminder for the note.
      if (now < snoozedUntil) return;

      const key = makeReminderKey(note.id, `snooze:${snoozedUntil}`, dueAt);
      if (!sentLog.sent[key] && !seen.has(key)) {
        seen.add(key);
        due.push({
          key,
          noteId: note.id,
          noteTitle: title,
          dueAt,
          type: 'snooze',
          label: 'Snooze over',
          message: `${noun} “${title}” — Snooze over`,
          fireAt: snoozedUntil,
        });
      }
      return;
    }

    const add = (
      reminderType: string,
      type: ReminderType,
      label: string,
      fireAt: number
    ) => {
      if (fireAt > now) return;
      const key = makeReminderKey(note.id, reminderType, dueAt);
      if (sentLog.sent[key] || seen.has(key)) return;
      seen.add(key);
      due.push({
        key,
        noteId: note.id,
        noteTitle: title,
        dueAt,
        type,
        label,
        message: `${noun} “${title}” — ${label}`,
        fireAt,
      });
    };

    (note.reminderOffsets ?? []).forEach((offset) => {
      if (!Number.isFinite(offset)) return;
      add(`offset:${offset}`, 'offset', formatReminderOffset(offset), dueTime - offset * MINUTE_MS);
    });

    add('due-now', 'due-now', 'Due now', dueTime);

    if (now >= dueTime) {
      // First overdue reminder is at the due time, then one every 24 hours.
      const day = Math.max(1, Math.floor((now - dueTime) / DAY_MS) + 1);
      add(`overdue-day-${day}`, 'overdue', `Overdue (day ${day})`, dueTime + (day - 1) * DAY_MS);
      return;
    }

    const remaining = dueTime - now;
    // Daily reminders only apply once an item is within the next 7 days.
    // Further-out items still get their configured reminderOffsets.
    if (remaining > DAY_MS && remaining <= WEEK_MS) {
      // Most recent 24-hour boundary that has already passed.
      const day = Math.max(1, Math.floor(remaining / DAY_MS));
      add(`daily-day-${day}`, 'daily', 'Daily reminder', dueTime - day * DAY_MS);
    }
  });

  return due.sort((a, b) => a.fireAt - b.fireAt);
}

/** Text shown in the in-app banner when the app opens with urgent items. */
export function getDueBanner(notes: NoteItem[], now: number): ReminderBannerData | null {
  const upcoming = notes.filter(isUpcomingNote);
  if (upcoming.length === 0) return null;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const overdue = upcoming.filter((note) => (getDueTimestamp(note) as number) < now);
  const dueToday = upcoming.filter((note) => {
    const time = getDueTimestamp(note) as number;
    return time >= now && time < tomorrow.getTime();
  });
  const dueSoon = upcoming.filter((note) => {
    const time = getDueTimestamp(note) as number;
    return time >= now && time < now + DAY_MS && time >= tomorrow.getTime();
  });

  const parts: string[] = [];
  if (overdue.length > 0) parts.push(`${overdue.length} overdue`);
  if (dueToday.length > 0) parts.push(`${dueToday.length} due today`);
  else if (dueSoon.length > 0) parts.push(`${dueSoon.length} due soon`);
  if (parts.length === 0) return null;

  const details = [...overdue, ...dueToday, ...dueSoon]
    .sort((a, b) => (getDueTimestamp(a) as number) - (getDueTimestamp(b) as number))
    .slice(0, 5)
    .map((note) => {
      const time = getDueTimestamp(note) as number;
      const state = time < now ? 'Overdue' : time < tomorrow.getTime() ? 'Due today' : 'Due soon';
      return `${state}: ${note.title || `${nounFor(note)} without a title`}`;
    });

  return { title: parts.join(', '), details };
}
