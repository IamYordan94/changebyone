'use client';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

export default function ProgressIndicator({ completed, total }: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          {completed}/{total}
        </span>
        <span className="font-semibold text-xs" style={{ color: 'var(--text-primary, var(--primary))' }}>{percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(to right, var(--primary), var(--secondary))`
          }}
        />
      </div>
    </div>
  );
}

