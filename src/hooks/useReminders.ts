import { useCallback, useEffect, useRef, useState } from 'react';
import { NoteItem } from '../types';
import { loadReminderLog, pruneReminderLog, saveReminderLog } from '../services/reminderLog';
import {
  clearSnoozedUntil,
  getDueBanner,
  getDueReminders,
  getSnoozedUntil,
  ReminderBannerData,
  ReminderLog,
  ReminderPermission,
  setSnoozedUntil,
} from '../utils/reminders';

const BASE_URL = import.meta.env.BASE_URL;
const ICON_URL = `${BASE_URL}icons/icon-192.png`;

type NotificationOptionsWithActions = NotificationOptions & {
  actions?: { action: string; title: string; icon?: string }[];
};

interface UseRemindersOptions {
  notes: NoteItem[];
  notesReady: boolean;
  onMarkDone: (id: string) => void;
  onSnoozed?: () => void;
}

const notificationSupported = typeof window !== 'undefined' && 'Notification' in window;

/** Always reads the browser's live value; never relies on React state. */
function readPermission(): ReminderPermission {
  if (!notificationSupported) return 'unsupported';
  if (Notification.permission === 'granted') return 'enabled';
  if (Notification.permission === 'denied') return 'blocked';
  return 'not-enabled';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  let timer: number | undefined;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        timer = window.setTimeout(() => resolve(null), 3000);
      }),
    ]);
  } catch (error) {
    console.error('Waiting for the service worker failed:', error);
    return null;
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

export function useReminders({
  notes,
  notesReady,
  onMarkDone,
  onSnoozed,
}: UseRemindersOptions) {
  const [permission, setPermission] = useState<ReminderPermission>(readPermission);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [banner, setBanner] = useState<ReminderBannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const notesRef = useRef(notes);
  const markDoneRef = useRef(onMarkDone);
  const onSnoozedRef = useRef(onSnoozed);
  const logRef = useRef<ReminderLog>(loadReminderLog());
  const bannerKeyRef = useRef('');
  const dueAtSnapshotRef = useRef<Map<string, string | undefined> | null>(null);

  notesRef.current = notes;
  markDoneRef.current = onMarkDone;
  onSnoozedRef.current = onSnoozed;

  const showBanner = useCallback((next: ReminderBannerData | null) => {
    if (!next) {
      bannerKeyRef.current = '';
      setBanner(null);
      setDismissed(false);
      return;
    }
    const key = `${next.title}|${next.details.join('|')}`;
    if (key !== bannerKeyRef.current) {
      bannerKeyRef.current = key;
      setDismissed(false);
    }
    setBanner(next);
  }, []);

  const showCombinedNotification = useCallback(
    async (title: string, details: string[], noteIds: string[]) => {
      if (readPermission() !== 'enabled' || !('serviceWorker' in navigator)) return;
      try {
        const registration = await navigator.serviceWorker.ready;
        const singleNote = noteIds.length === 1;
        const options: NotificationOptionsWithActions = {
          body: details.join('\n').slice(0, 500) || 'Open NoteNest to see what needs attention.',
          icon: ICON_URL,
          badge: ICON_URL,
          tag: singleNote
            ? `notenest-reminder-${noteIds[0]}`
            : `notenest-reminder-${noteIds.join('-')}`,
          data: {
            noteId: singleNote ? noteIds[0] : undefined,
            noteIds,
            baseUrl: BASE_URL,
          },
          actions: singleNote
            ? [
                { action: 'mark-done', title: 'Mark done' },
                { action: 'snooze-1h', title: 'Snooze 1 hour' },
              ]
            : undefined,
        };
        await registration.showNotification(title, options as NotificationOptions);
      } catch (error) {
        console.warn('Failed to show reminder notification:', error);
      }
    },
    []
  );

  const runCheck = useCallback(() => {
    if (!notesReady) return;

    const now = Date.now();
    const pruned = pruneReminderLog(logRef.current, notesRef.current);
    logRef.current = pruned;
    saveReminderLog(pruned);

    const due = getDueReminders(notesRef.current, now, pruned);
    if (due.length > 0) {
      const updatedLog: ReminderLog = {
        sent: { ...pruned.sent },
        snoozedUntil: { ...pruned.snoozedUntil },
      };
      due.forEach((reminder) => {
        updatedLog.sent[reminder.key] = now;
      });

      const snoozedNoteIds = due
        .filter((reminder) => reminder.type === 'snooze')
        .map((reminder) => reminder.noteId);
      if (snoozedNoteIds.length > 0) {
        snoozedNoteIds.forEach((noteId) => {
          delete updatedLog.snoozedUntil[noteId];
        });
        // Mark the reminders that were paused as handled, so the snooze ends
        // with exactly one notification instead of an immediate backlog.
        getDueReminders(notesRef.current, now, updatedLog).forEach((reminder) => {
          updatedLog.sent[reminder.key] = now;
        });
      }

      logRef.current = updatedLog;
      saveReminderLog(updatedLog);

      const noteIds = Array.from(new Set(due.map((reminder) => reminder.noteId)));
      const title =
        noteIds.length > 1
          ? `${noteIds.length} items need attention`
          : `${due[0].noteTitle} — ${due[0].label}`;
      const details = due.map((reminder) => `${reminder.noteTitle}: ${reminder.label}`);

      showBanner({ title, details });
      void showCombinedNotification(title, details, noteIds);
      return;
    }

    showBanner(getDueBanner(notesRef.current, now));
  }, [notesReady, showBanner, showCombinedNotification]);

  const refreshPermission = useCallback(() => setPermission(readPermission()), []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission | null> => {
    if (!notificationSupported) {
      refreshPermission();
      return null;
    }
    try {
      const result = await Notification.requestPermission();
      // Re-read instead of trusting the returned value or any earlier state.
      refreshPermission();
      return result;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      refreshPermission();
      return Notification.permission;
    }
  }, [refreshPermission]);

  const enableReminders = useCallback(async () => {
    if (!notificationSupported) {
      refreshPermission();
      return;
    }
    await requestPermission();
    runCheck();
  }, [refreshPermission, requestPermission, runCheck]);

  const sendTestNotification = useCallback(async () => {
    setTestStatus(null);

    if (!notificationSupported) {
      const message = 'Notification is not supported in this browser';
      console.error(message);
      setTestStatus(message);
      return;
    }

    if (Notification.permission !== 'granted') await requestPermission();
    const currentPermission = readPermission();
    setPermission(currentPermission);

    if (currentPermission !== 'enabled') {
      setTestStatus('Permission blocked, enable it in browser settings');
      return;
    }

    const options: NotificationOptions = {
      body: 'Reminders are working. You will see due items here.',
      icon: ICON_URL,
      badge: ICON_URL,
      tag: 'notenest-test',
      data: { baseUrl: BASE_URL },
    };

    try {
      const registration = await waitForServiceWorker();
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification('NoteNest test', options);
        setTestStatus('Test notification sent');
        return;
      }

      // No active service worker (or showNotification is unavailable):
      // still try the basic Notification API, then explain the SW problem.
      try {
        new Notification('NoteNest test', options);
      } catch (fallbackError) {
        console.error('Fallback notification failed:', fallbackError);
      }
      setTestStatus('No active service worker, reload the page');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      setTestStatus(getErrorMessage(error));
    }
  }, [refreshPermission, requestPermission]);

  const dismissBanner = useCallback(() => setDismissed(true), []);

  const snoozeReminder = useCallback((noteId: string) => {
    const until = Date.now() + 60 * 60 * 1000;
    const updated = setSnoozedUntil(logRef.current, noteId, until);
    logRef.current = updated;
    saveReminderLog(updated);
    onSnoozedRef.current?.();
  }, []);

  // Editing a due date makes any existing snooze obsolete.
  useEffect(() => {
    if (!notesReady) return;

    const current = new Map(notes.map((note) => [note.id, note.dueAt] as const));
    const previous = dueAtSnapshotRef.current;

    if (previous) {
      let updatedLog = logRef.current;
      let changed = false;
      current.forEach((dueAt, noteId) => {
        if (previous.get(noteId) !== dueAt && getSnoozedUntil(updatedLog, noteId) !== null) {
          updatedLog = clearSnoozedUntil(updatedLog, noteId);
          changed = true;
        }
      });
      if (changed) {
        logRef.current = updatedLog;
        saveReminderLog(updatedLog);
      }
    }

    dueAtSnapshotRef.current = current;
  }, [notes, notesReady]);

  // App start, once notes have actually been loaded from storage.
  useEffect(() => {
    if (!notesReady) return;
    runCheck();
  }, [notesReady, runCheck]);

  // While the app stays open.
  useEffect(() => {
    if (!notesReady) return;
    const interval = window.setInterval(runCheck, 60_000);
    return () => window.clearInterval(interval);
  }, [notesReady, runCheck]);

  // When the user comes back to the tab after the phone was asleep.
  useEffect(() => {
    if (!notesReady) return;
    const handleVisibility = () => {
      refreshPermission();
      if (document.visibilityState === 'visible') runCheck();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [notesReady, runCheck, refreshPermission]);

  // Actions from notification clicks are delivered to the open app window.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; noteId?: string } | null;
      if (!data?.noteId) return;
      if (data.type === 'REMINDER_MARK_DONE') markDoneRef.current(data.noteId);
      else if (data.type === 'REMINDER_SNOOZE') snoozeReminder(data.noteId);
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [snoozeReminder]);

  return {
    banner,
    bannerDismissed: dismissed,
    dismissBanner,
    permission,
    notificationSupported,
    testStatus,
    refreshPermission,
    enableReminders,
    sendTestNotification,
    runCheck,
  };
}
