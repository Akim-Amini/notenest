import { isScheduledKind, NoteItem } from '../types';

export type UpcomingGroupId = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later';

export interface UpcomingGroup {
  id: UpcomingGroupId;
  label: string;
  notes: NoteItem[];
}

export function getDueTimestamp(note: NoteItem): number | null {
  if (!note.dueAt) return null;
  const timestamp = new Date(note.dueAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function isUpcomingNote(note: NoteItem): boolean {
  return (
    !note.isDeleted &&
    !note.completed &&
    isScheduledKind(note.kind) &&
    getDueTimestamp(note) !== null
  );
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function groupUpcomingNotes(notes: NoteItem[], now: number = Date.now()): UpcomingGroup[] {
  const upcoming = notes
    .filter(isUpcomingNote)
    .sort((a, b) => (getDueTimestamp(a) ?? 0) - (getDueTimestamp(b) ?? 0));

  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const dayAfterTomorrowStart = addDays(todayStart, 2);
  // "This week" ends after Sunday, so next week falls into "Later".
  const daysUntilSunday = (7 - new Date(now).getDay()) % 7;
  const weekEnd = addDays(todayStart, daysUntilSunday + 1);

  const buckets: Record<UpcomingGroupId, NoteItem[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    week: [],
    later: [],
  };

  upcoming.forEach((note) => {
    const due = getDueTimestamp(note) ?? 0;
    if (due < now) buckets.overdue.push(note);
    else if (due < tomorrowStart) buckets.today.push(note);
    else if (due < dayAfterTomorrowStart) buckets.tomorrow.push(note);
    else if (due < weekEnd) buckets.week.push(note);
    else buckets.later.push(note);
  });

  return [
    { id: 'overdue', label: 'Overdue', notes: buckets.overdue },
    { id: 'today', label: 'Today', notes: buckets.today },
    { id: 'tomorrow', label: 'Tomorrow', notes: buckets.tomorrow },
    { id: 'week', label: 'This week', notes: buckets.week },
    { id: 'later', label: 'Later', notes: buckets.later },
  ];
}
