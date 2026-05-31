import { useEffect, useRef, useState } from 'react';

interface Props {
  exerciseName: string;
  onStop: (durationSeconds: number) => void;
}

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function ExerciseTimer({ exerciseName, onStop }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  function handleStart() {
    if (running) return;
    startRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
    intervalRef.current = window.setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 250);
  }

  function handlePause() {
    if (!running) return;
    setRunning(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startRef.current) {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      startRef.current = null;
    }
  }

  function handleStop() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    let duration = elapsed;
    if (running && startRef.current) {
      duration = Math.floor((Date.now() - startRef.current) / 1000);
    }
    setRunning(false);
    setElapsed(0);
    startRef.current = null;
    onStop(duration);
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-400">Exercise</p>
      <h4 className="mt-1 text-lg font-semibold text-slate-100">{exerciseName}</h4>
      <div className="mt-3 flex items-center gap-4">
        <div className="text-2xl font-mono text-sky-300">{formatTime(elapsed)}</div>
        <div className="ml-auto flex gap-2">
          {!running ? (
            <button
              type="button"
              className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900"
              onClick={handleStart}
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900"
              onClick={handlePause}
            >
              Pause
            </button>
          )}
          <button
            type="button"
            className="rounded-full bg-red-500 px-3 py-2 text-sm font-semibold text-slate-100"
            onClick={handleStop}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
