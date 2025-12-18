'use client';

interface WordDisplayProps {
  word: string;
  label?: string;
}

export default function WordDisplay({ word, label }: WordDisplayProps) {
  return (
    <div className="text-center">
      {label && (
        <p className="text-sm text-slate-400 mb-6 font-semibold uppercase tracking-widest">
          {label}
        </p>
      )}
      <div className="flex justify-center gap-3 flex-wrap">
        {word.toUpperCase().split('').map((letter, index) => (
          <div
            key={index}
            className="w-16 h-16 flex items-center justify-center glass rounded-xl border-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:rotate-3 transform"
            style={{
              borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
              animationDelay: `${index * 50}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 60%, transparent)';
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 10%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 30%, transparent)';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <span className="text-3xl font-black text-white">
              {letter}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
