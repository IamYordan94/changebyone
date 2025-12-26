'use client';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

export default function ResetConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  message = 'Are you sure you want to reset this puzzle? Your word chain will be cleared, but the timer will continue running.'
}: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative glass rounded-3xl p-8 max-w-md w-full">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors"
        >
          ×
        </button>

        <h2 className="text-2xl font-black text-gradient mb-4">Reset Puzzle?</h2>

        <p className="text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 mb-6">
          <p className="text-sm text-slate-400 mb-2">What will be reset:</p>
          <ul className="space-y-1 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-red-400">•</span>
              <span>Word chain (back to start word)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400">•</span>
              <span>Move counter (back to 0)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Timer (continues running)</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-600/40 text-slate-300 hover:bg-slate-700/50 transition-all duration-300 font-medium"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(to right, var(--primary), var(--secondary))'
            }}
          >
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  );
}

