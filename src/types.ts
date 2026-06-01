export type WorkoutDayKey = 'monday' | 'wednesday' | 'friday' | 'sunday';

export interface ProfileState {
  weight: number;
  maxPushups: number;
}

export interface NotesEntry {
  date: string;
  text: string;
}

export interface SessionEntry {
  id: string;
  date: string; // ISO date
  exercise: string;
  durationSeconds: number;
}

export interface HistoryEntry {
  date: string;
  value: number;
}

export interface ProgressState {
  profile: ProfileState;
  week: number;
  streak: number;
  longestStreak: number;
  completed: Record<WorkoutDayKey, boolean>;
  notes: NotesEntry[];
  sessions?: SessionEntry[];
  weightHistory: HistoryEntry[];
  maxPushupHistory: HistoryEntry[];
  lastSynced: string | null;
}

export interface Exercise {
  name: string;
  description: string;
  easierVariation: string;
  commonMistakes: string;
  safetyTips: string;
  media?: (
    | { type: 'youtube'; videoId: string; title?: string }
    | { type: 'image' | 'gif' | 'video'; src: string; poster?: string; alt?: string }
  )[];
}

export interface WorkoutDay {
  day: WorkoutDayKey;
  title: string;
  exercises: string[];
}

export interface ProgressUpdate {
  week?: number;
  profile?: Partial<ProfileState>;
  completed?: Partial<Record<WorkoutDayKey, boolean>>;
  notes?: NotesEntry[];
  sessions?: SessionEntry[];
  weightHistory?: HistoryEntry[];
  maxPushupHistory?: HistoryEntry[];
}
