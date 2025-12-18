'use client';

interface MoveCounterProps {
  moves: number;
  maxMoves: number;
}

export default function MoveCounter({ moves, maxMoves }: MoveCounterProps) {
  const remaining = maxMoves - moves;
  const percentage = (remaining / maxMoves) * 100;


  const getGradient = () => {
    if (percentage > 50) return 'from-green-500 to-emerald-500';
    if (percentage > 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-orange-500';
  };

  return (
    <div className="text-center space-y-3 min-w-[200px]">
      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-slate-400 font-semibold uppercase tracking-wide">Moves</span>
        <span className="text-white font-black text-lg">{moves} / {maxMoves}</span>
      </div>
      <div className="relative w-full h-4 glass rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGradient()} transition-all duration-700 rounded-full shadow-lg`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium">{remaining} moves remaining</p>
    </div>
  );
}
