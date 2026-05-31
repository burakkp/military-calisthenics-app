import type { HistoryEntry } from '../types';

interface ProgressChartProps {
  data: HistoryEntry[];
  label: string;
  color: string;
  unit: string;
}

export default function ProgressChart({ data, label, color, unit }: ProgressChartProps) {
  const values = data.map((entry) => entry.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">
            {data[data.length - 1]?.value.toFixed(1)} {unit}
          </p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
          Trend
        </div>
      </div>
      <div className="mt-5 flex h-20 items-end gap-2">
        {values.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={`${label}-${index}`}
              className="w-full rounded-full bg-gradient-to-t"
              style={{
                height: `${Math.max(height, 8)}%`,
                backgroundImage: `linear-gradient(180deg, ${color} 0%, rgba(15, 23, 42, 0.1) 100%)`
              }}
            />
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>{data[0]?.date ?? ''}</span>
        <span>{data[data.length - 1]?.date ?? ''}</span>
      </div>
    </div>
  );
}
