import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Exercise, HistoryEntry, ProgressState, ProgressUpdate, WorkoutDayKey } from './types';
import ExerciseDetail from './components/ExerciseDetail';
import ProgressChart from './components/ProgressChart';
import ExerciseTimer from './components/ExerciseTimer';
import { workoutPlan, exerciseLibrary } from './data';
import { loadState, saveState, addQueueItem, drainQueue, getQueueSize, createNoteEntry, createSessionEntry } from './lib/storage';
import { fetchProgress, submitProgress } from './lib/api';

const defaultState: ProgressState = loadState();

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function calculateCompletion(completed: ProgressState['completed']): number {
  const total = Object.keys(completed).length;
  const done = Object.values(completed).filter(Boolean).length;
  return total === 0 ? 0 : (done / total) * 100;
}

function App() {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [notesText, setNotesText] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string>('Push-up');
  const [statusMessage, setStatusMessage] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'library' | 'notes'>('home');

  const completion = useMemo(() => calculateCompletion(state.completed), [state.completed]);
  const pendingSync = getQueueSize();
  const exerciseList = useMemo(() => Array.from(new Set(workoutPlan.flatMap((item) => item.exercises))), []);
  const selectedExerciseDetails = useMemo<Exercise | null>(() => {
    return exerciseLibrary[selectedExercise] ?? null;
  }, [selectedExercise]);

  const historySeries = useMemo(() => {
    const weightSeries: HistoryEntry[] = state.weightHistory;
    const pushupSeries: HistoryEntry[] = state.maxPushupHistory;
    return { weightSeries, pushupSeries };
  }, [state.weightHistory, state.maxPushupHistory]);

  useEffect(() => {
    async function init() {
      try {
        const remote = await fetchProgress();
        if (remote) {
          setState(saveState({ ...remote, lastSynced: new Date().toISOString() }));
        } else {
          setState(saveState({ ...defaultState, lastSynced: null }));
        }
      } catch {
        setStatusMessage('Offline mode enabled. Using local state.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const syncProgress = useCallback(async () => {
    const queue = drainQueue();
    if (queue.length === 0 && online) {
      await submitProgress(state);
      setState(saveState({ ...state, lastSynced: new Date().toISOString() }));
      setStatusMessage('Synchronized with server.');
      return;
    }

    if (queue.length === 0) {
      return;
    }

    try {
      const mergedUpdate = queue.reduce<ProgressUpdate>(
        (acc, item) => ({
          week: item.week ?? acc.week,
          profile: { ...acc.profile, ...item.profile },
          completed: { ...acc.completed, ...item.completed },
          notes: item.notes ?? acc.notes
        }),
        {
          week: state.week,
          profile: state.profile,
          completed: state.completed,
          notes: state.notes
        }
      );

      const mergedState: ProgressState = {
        ...state,
        ...mergedUpdate,
        profile: { ...state.profile, ...mergedUpdate.profile },
        completed: { ...state.completed, ...mergedUpdate.completed },
        notes: mergedUpdate.notes ?? state.notes,
        lastSynced: new Date().toISOString()
      };

      await submitProgress(mergedState);
      setState(saveState(mergedState));
      setStatusMessage('Queued updates synced successfully.');
    } catch {
      setStatusMessage('Sync failed. Retaining queued updates.');
      queue.forEach(addQueueItem);
    }
  }, [online, state]);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      setStatusMessage('Online. Syncing queued updates...');
      syncProgress();
    }

    function handleOffline() {
      setOnline(false);
      setStatusMessage('Offline. Local changes will sync when online.');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncProgress]);

  function updateState(update: ProgressUpdate) {
    const today = new Date().toISOString().split('T')[0];
    const historyUpdate: ProgressUpdate = {};

    if (update.profile?.weight !== undefined && update.profile.weight !== state.profile.weight) {
      historyUpdate.weightHistory = [
        ...state.weightHistory,
        { date: today, value: update.profile.weight }
      ];
    }

    if (update.profile?.maxPushups !== undefined && update.profile.maxPushups !== state.profile.maxPushups) {
      historyUpdate.maxPushupHistory = [
        ...state.maxPushupHistory,
        { date: today, value: update.profile.maxPushups }
      ];
    }

    const next = saveState({
      ...state,
      ...update,
      profile: { ...state.profile, ...update.profile },
      completed: { ...state.completed, ...update.completed },
      weightHistory: historyUpdate.weightHistory ?? state.weightHistory,
      maxPushupHistory: historyUpdate.maxPushupHistory ?? state.maxPushupHistory
    });

    setState(next);
    addQueueItem({ ...update, ...historyUpdate });
    if (online) {
      void syncProgress();
    }
  }

  function handleToggleComplete(day: WorkoutDayKey) {
    updateState({
      completed: {
        [day]: !state.completed[day]
      }
    });
  }

  function handleProfileChange(field: keyof ProgressState['profile'], value: number) {
    updateState({ profile: { [field]: value } });
  }

  function handleWeekChange(value: number) {
    updateState({ week: value });
  }

  function handleAddNote() {
    if (!notesText.trim()) return;
    const note = createNoteEntry(notesText);
    updateState({ notes: [note, ...state.notes] });
    setNotesText('');
  }

  function handleExerciseStop(durationSeconds: number) {
    const session = createSessionEntry(selectedExercise, durationSeconds);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const durationLabel = `${minutes}m ${seconds}s`;
    updateState({ sessions: [session, ...(state.sessions ?? [])], notes: [createNoteEntry(`${selectedExercise} session — ${durationLabel}`), ...state.notes] });
    setStatusMessage(`Saved session: ${durationLabel}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 px-6 py-10 shadow-card">
          <h1 className="text-2xl font-semibold">Military Calisthenics Tracker</h1>
          <p className="mt-4 text-slate-400">Loading your tracker...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Week {state.week}</p>
              <h1 className="mt-3 text-3xl font-semibold">Military Calisthenics Tracker</h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Track workouts, weight, push-up max, streaks, and notes with offline caching and sync.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300 shadow-inner">
              <span>Status: {online ? 'Online' : 'Offline'}</span>
              <span>Pending Sync: {pendingSync}</span>
              <span>Last Sync: {state.lastSynced ?? 'Never'}</span>
            </div>
          </div>
        </header>

        <div className="mb-6 block rounded-3xl border border-slate-800 bg-slate-900 p-3 shadow-card md:hidden">
          <nav className="grid grid-cols-4 gap-2">
            {[
              { key: 'home', label: 'Home' },
              { key: 'history', label: 'History' },
              { key: 'library', label: 'Library' },
              { key: 'notes', label: 'Notes' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`rounded-3xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${activeTab === tab.key ? 'bg-sky-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'}`}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="hidden space-y-6 md:block">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Progress Summary</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weight</p>
                  <p className="mt-2 text-3xl font-semibold text-emerald-300">{state.profile.weight.toFixed(1)} kg</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Push-up Max</p>
                  <p className="mt-2 text-3xl font-semibold text-sky-300">{state.profile.maxPushups}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current Streak</p>
                  <p className="mt-2 text-3xl font-semibold text-violet-300">{state.streak} days</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Completion</p>
                  <p className="mt-2 text-3xl font-semibold text-amber-300">{formatPercent(completion)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <div className="grid gap-4 md:grid-cols-2">
                <ProgressChart data={historySeries.weightSeries} label="Weight" color="#10b981" unit="kg" />
                <ProgressChart data={historySeries.pushupSeries} label="Push-up Max" color="#0ea5e9" unit="reps" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Sessions</h2>
              <div className="mt-4 space-y-3">
                {(!state.sessions || state.sessions.length === 0) ? (
                  <p className="text-slate-400 text-sm">No recorded sessions yet. Start a timer to log sessions.</p>
                ) : (
                  state.sessions.slice(0, 8).map((s) => (
                    <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-100">{s.exercise}</div>
                          <div className="text-slate-400 text-xs">{new Date(s.date).toLocaleString()}</div>
                        </div>
                        <div className="font-mono text-sky-300">{Math.floor(s.durationSeconds/60)}m {s.durationSeconds%60}s</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Workout Plan</h2>
              <div className="mt-5 space-y-4">
                {workoutPlan.map((item) => (
                  <div key={item.day} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.exercises.join(', ')}</p>
                      </div>
                      <button
                        type="button"
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${state.completed[item.day] ? 'bg-emerald-500 text-slate-900' : 'border border-slate-700 text-slate-200 hover:border-slate-500'}`}
                        onClick={() => handleToggleComplete(item.day)}
                      >
                        {state.completed[item.day] ? 'Completed' : 'Mark Completed'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Notes</h2>
              <div className="mt-5 space-y-4">
                <textarea
                  rows={4}
                  value={notesText}
                  onChange={(event) => setNotesText(event.target.value)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  placeholder="Add a quick training note..."
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                    onClick={handleAddNote}
                  >
                    Save note
                  </button>
                </div>
                <div className="space-y-3">
                  {state.notes.length === 0 ? (
                    <p className="text-slate-400">No notes yet. Add notes to preserve workout impressions.</p>
                  ) : (
                    state.notes.map((note) => (
                      <div key={note.date + note.text} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">{note.date}</p>
                        <p className="mt-2 text-slate-100">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:hidden">
            {activeTab === 'home' && (
              <>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
                  <h2 className="text-xl font-semibold">Progress Summary</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weight</p>
                      <p className="mt-2 text-3xl font-semibold text-emerald-300">{state.profile.weight.toFixed(1)} kg</p>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Push-up Max</p>
                      <p className="mt-2 text-3xl font-semibold text-sky-300">{state.profile.maxPushups}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current Streak</p>
                      <p className="mt-2 text-3xl font-semibold text-violet-300">{state.streak} days</p>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Completion</p>
                      <p className="mt-2 text-3xl font-semibold text-amber-300">{formatPercent(completion)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                  <div className="mt-5 space-y-4">
                    <label className="grid gap-2 text-sm text-slate-300">
                      Week number
                      <input
                        type="number"
                        min={1}
                        value={state.week}
                        onChange={(event) => handleWeekChange(Number(event.target.value))}
                        className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                      Weight (kg)
                      <input
                        type="number"
                        min={30}
                        step={0.1}
                        value={state.profile.weight}
                        onChange={(event) => handleProfileChange('weight', Number(event.target.value))}
                        className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-300">
                      Push-up max
                      <input
                        type="number"
                        min={0}
                        value={state.profile.maxPushups}
                        onChange={(event) => handleProfileChange('maxPushups', Number(event.target.value))}
                        className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'history' && (
              <>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
                  <div className="grid gap-4">
                    <ProgressChart data={historySeries.weightSeries} label="Weight" color="#10b981" unit="kg" />
                    <ProgressChart data={historySeries.pushupSeries} label="Push-up Max" color="#0ea5e9" unit="reps" />
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
                  <h2 className="text-xl font-semibold">Recent history</h2>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weight entries</p>
                      <ul className="mt-3 space-y-3 text-slate-100">
                        {state.weightHistory.slice(-4).reverse().map((entry) => (
                          <li key={`${entry.date}-${entry.value}`} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>{entry.date}</span>
                              <span className="font-semibold text-emerald-300">{entry.value.toFixed(1)} kg</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Push-up max entries</p>
                      <ul className="mt-3 space-y-3 text-slate-100">
                        {state.maxPushupHistory.slice(-4).reverse().map((entry) => (
                          <li key={`${entry.date}-${entry.value}`} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>{entry.date}</span>
                              <span className="font-semibold text-sky-300">{entry.value}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'library' && (
              <>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
                  <h2 className="text-xl font-semibold">Daily Exercise Library</h2>
                  <div className="mt-5 grid gap-3">
                    {exerciseList.map((exercise) => {
                      const isSelected = exercise === selectedExercise;
                      return (
                        <button
                          key={exercise}
                          type="button"
                          className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isSelected ? 'border-sky-400 bg-slate-950 shadow-lg' : 'border-slate-800 bg-slate-950 hover:border-slate-500'}`}
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          <h3 className="text-base font-semibold text-slate-100">{exercise}</h3>
                          <p className="mt-2 text-sm text-slate-400">{exerciseLibrary[exercise]?.description ?? 'Description unavailable.'}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recent sessions</p>
                    <ul className="mt-3 space-y-3 text-slate-100">
                      {(state.sessions ?? []).slice(0,6).map((s) => (
                        <li key={s.id} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>{s.exercise}</span>
                            <span className="font-mono text-sky-300">{Math.floor(s.durationSeconds/60)}m {s.durationSeconds%60}s</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">{new Date(s.date).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {selectedExerciseDetails ? <ExerciseDetail exercise={selectedExerciseDetails} /> : null}
              </>
            )}
            {activeTab === 'notes' && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
                <h2 className="text-xl font-semibold">Notes</h2>
                <div className="mt-5 space-y-4">
                  <textarea
                    rows={4}
                    value={notesText}
                    onChange={(event) => setNotesText(event.target.value)}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                    placeholder="Add a quick training note..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                      onClick={handleAddNote}
                    >
                      Save note
                    </button>
                  </div>
                  <div className="space-y-3">
                    {state.notes.length === 0 ? (
                      <p className="text-slate-400">No notes yet. Add notes to preserve workout impressions.</p>
                    ) : (
                      state.notes.map((note) => (
                        <div key={note.date + note.text} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-sm text-slate-400">{note.date}</p>
                          <p className="mt-2 text-slate-100">{note.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden space-y-6 md:block">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="mt-5 space-y-4">
                <label className="grid gap-2 text-sm text-slate-300">
                  Week number
                  <input
                    type="number"
                    min={1}
                    value={state.week}
                    onChange={(event) => handleWeekChange(Number(event.target.value))}
                    className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Weight (kg)
                  <input
                    type="number"
                    min={30}
                    step={0.1}
                    value={state.profile.weight}
                    onChange={(event) => handleProfileChange('weight', Number(event.target.value))}
                    className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Push-up max
                  <input
                    type="number"
                    min={0}
                    value={state.profile.maxPushups}
                    onChange={(event) => handleProfileChange('maxPushups', Number(event.target.value))}
                    className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  />
                </label>
                <div>
                  <ExerciseTimer exerciseName={selectedExercise} onStop={handleExerciseStop} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Daily Exercise Library</h2>
              <div className="mt-5 grid gap-3">
                {exerciseList.map((exercise) => {
                  const isSelected = exercise === selectedExercise;
                  return (
                    <button
                      key={exercise}
                      type="button"
                      className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isSelected ? 'border-sky-400 bg-slate-950 shadow-lg' : 'border-slate-800 bg-slate-950 hover:border-slate-500'}`}
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <h3 className="text-base font-semibold text-slate-100">{exercise}</h3>
                      <p className="mt-2 text-sm text-slate-400">{exerciseLibrary[exercise]?.description ?? 'Description unavailable.'}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedExerciseDetails ? <ExerciseDetail exercise={selectedExerciseDetails} /> : null}

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-card">
              <h2 className="text-xl font-semibold">Sync Notes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {statusMessage || 'Your progress is stored locally and syncs automatically when online.'}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default App;
