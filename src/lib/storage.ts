import type { NotesEntry, ProgressState, ProgressUpdate } from '../types';

const STORAGE_KEY = 'military-calisthenics-state';
const QUEUE_KEY = 'military-calisthenics-queue';

const today = new Date().toISOString().split('T')[0];

const defaultState: ProgressState = {
  profile: {
    weight: 90,
    maxPushups: 10
  },
  week: 1,
  streak: 0,
  longestStreak: 0,
  completed: {
    monday: false,
    wednesday: false,
    friday: false,
    sunday: false
  },
  notes: [],
  weightHistory: [{ date: today, value: 90 }],
  maxPushupHistory: [{ date: today, value: 10 }],
  lastSynced: null
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadState(): ProgressState {
  return safeParse<ProgressState>(localStorage.getItem(STORAGE_KEY), defaultState);
}

export function saveState(state: ProgressState): ProgressState {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function addQueueItem(update: ProgressUpdate): void {
  const queue = safeParse<ProgressUpdate[]>(localStorage.getItem(QUEUE_KEY), []);
  queue.push(update);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function drainQueue(): ProgressUpdate[] {
  const queue = safeParse<ProgressUpdate[]>(localStorage.getItem(QUEUE_KEY), []);
  localStorage.removeItem(QUEUE_KEY);
  return queue;
}

export function getQueueSize(): number {
  return safeParse<ProgressUpdate[]>(localStorage.getItem(QUEUE_KEY), []).length;
}

export function createNoteEntry(text: string): NotesEntry {
  return {
    date: new Date().toISOString().split('T')[0],
    text: text.trim()
  };
}
