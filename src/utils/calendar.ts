import { formatReminderOffset, NoteItem } from '../types';

const MAX_LINE_OCTETS = 75;
const MINUTE_MS = 60 * 1000;
const ASSIGNMENT_BLOCK_MINUTES = 30;

/** Escape a value for an RFC 5545 TEXT property. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/** Format a Date as an RFC 5545 UTC DATE-TIME: YYYYMMDDTHHMMSSZ. */
function formatUtc(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** ISO 8601 negative duration for a VALARM TRIGGER, e.g. -P1D or -PT1H30M. */
function formatTrigger(minutes: number): string {
  const total = Math.max(1, Math.round(minutes));
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const mins = total % 60;

  let value = '-P';
  if (days) value += `${days}D`;
  if (hours || mins) {
    value += 'T';
    if (hours) value += `${hours}H`;
    if (mins) value += `${mins}M`;
  }
  return value;
}

/** Fold a content line at 75 UTF-8 octets, without splitting multi-byte chars. */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = '';
  let currentOctets = 0;
  let continuationPrefix = 0; // continuation lines start with a 1-octet space

  for (const char of line) {
    const octets = encoder.encode(char).length;
    if (current && currentOctets + continuationPrefix + octets > MAX_LINE_OCTETS) {
      chunks.push(current);
      current = '';
      currentOctets = 0;
      continuationPrefix = 1;
    }
    current += char;
    currentOctets += octets;
  }
  if (current) chunks.push(current);

  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join('\r\n');
}

/** FNV-1a hash used to build deterministic, stable UIDs. */
function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * A stable UID for an item. Saved notes use their immutable id; unsaved editor
 * drafts fall back to a deterministic hash of their identifying fields so
 * repeated exports still update the same calendar entry.
 */
export function getCalendarUid(
  note: Pick<NoteItem, 'id' | 'title' | 'kind' | 'dueAt'>
): string {
  const identity = note.id?.trim()
    ? note.id
    : `${note.kind ?? 'general'}|${note.title ?? ''}|${note.dueAt ?? ''}`;
  return `${hashString(identity)}@notenest`;
}

function buildDescription(note: NoteItem): string {
  const lines: string[] = [];
  if (note.subject) lines.push(`Subject: ${note.subject}`);
  if (note.priority) lines.push(`Priority: ${note.priority}`);

  if (note.type === 'list') {
    const items = note.checklist ?? [];
    if (items.length > 0) {
      lines.push('Checklist:');
      items.forEach((item) => {
        lines.push(`${item.completed ? '[x]' : '[ ]'} ${item.text}`);
      });
    }
  } else if (note.content) {
    lines.push(note.content);
  }

  return lines.join('\n');
}

/** Build an RFC 5545 VCALENDAR string containing one VEVENT for the item. */
export function buildCalendarEvent(note: NoteItem): string {
  if (!note.dueAt) {
    throw new Error('This item does not have a due date.');
  }
  const dueDate = new Date(note.dueAt);
  if (Number.isNaN(dueDate.getTime())) {
    throw new Error('This item has an invalid due date.');
  }

  const isEvent = note.kind === 'event';
  const start = new Date(
    dueDate.getTime() - (isEvent ? 0 : ASSIGNMENT_BLOCK_MINUTES * MINUTE_MS)
  );
  const summary = note.title?.trim() || (isEvent ? 'Event' : 'Assignment');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NoteNest//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${getCalendarUid(note)}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    isEvent ? 'DURATION:PT1H' : `DURATION:PT${ASSIGNMENT_BLOCK_MINUTES}M`,
    `SUMMARY:${escapeText(summary)}`,
  ];

  const description = buildDescription(note);
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  if (note.eventLocation) lines.push(`LOCATION:${escapeText(note.eventLocation)}`);
  if (note.subject) lines.push(`CATEGORIES:${escapeText(note.subject)}`);

  (note.reminderOffsets ?? []).forEach((offset) => {
    if (!Number.isFinite(offset) || offset <= 0) return;
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(`${summary} - ${formatReminderOffset(offset)}`)}`,
      `TRIGGER:${formatTrigger(offset)}`,
      'END:VALARM'
    );
  });

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

/** Download an item as an .ics file using a Blob URL. */
export function downloadNoteAsIcs(note: NoteItem): void {
  const blob = new Blob([buildCalendarEvent(note)], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const rawName = note.title?.trim() || (note.kind === 'event' ? 'event' : 'assignment');
  const safeName =
    rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'calendar-event';

  link.href = url;
  link.download = `${safeName}.ics`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Keep the blob URL alive briefly so mobile browsers can start the download.
  window.setTimeout(() => {
    if (link.parentNode) link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1500);
}
