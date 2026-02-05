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
  message = 'Are you sure you want to reset this puzzle? Your word chain will be cleared.'
}: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in-up">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 sm:mx-4">
        <button
          onClick={onCancel}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-white text-xl sm:text-2xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl sm:text-2xl font-black text-gradient mb-3 sm:mb-4 pr-8">Reset Puzzle?</h2>

        <p className="text-slate-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
          {message}
        </p>

        <div className="bg-slate-800/40 rounded-xl p-3 sm:p-4 border border-slate-700/50 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-slate-400 mb-2">What will be reset:</p>
          <ul className="space-y-1 text-xs sm:text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-red-400 flex-shrink-0">•</span>
              <span>Word chain (back to start word)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400 flex-shrink-0">•</span>
              <span>Move counter (back to 0)</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-slate-600/40 text-slate-300 hover:bg-slate-700/50 transition-all duration-300 font-medium text-sm sm:text-base"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
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

