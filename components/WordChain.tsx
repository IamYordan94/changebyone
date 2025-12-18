'use client';

interface WordChainProps {
  chain: string[];
}

export default function WordChain({ chain }: WordChainProps) {
  if (chain.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Your Path</h3>
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {chain.map((word, index) => (
          <div key={index} className="flex items-center">
            <div className="px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 font-mono text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-200"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 50%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.5)';
              }}>
              {word.toUpperCase()}
            </div>
            {index < chain.length - 1 && (
              <span className="mx-2 text-xl font-bold" style={{ color: 'var(--text-primary, var(--primary))' }}>→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
