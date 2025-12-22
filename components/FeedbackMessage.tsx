'use client';

import Image from 'next/image';

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function FeedbackMessage({ type, message }: FeedbackMessageProps) {
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/40',
      text: 'text-green-300',
      icon: '✓',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500/20 to-red-400/20',
      border: 'border-red-500/40',
      text: 'text-red-300',
      icon: '✗',
    },
    info: {
      bg: 'bg-gradient-to-r from-slate-600/20 to-slate-500/20',
      border: 'border-blue-500/40',
      text: 'text-blue-300',
      icon: 'ℹ',
    },
  };

  const style = styles[type];

  return (
    <div className={`p-5 rounded-2xl border-2 ${style.bg} ${style.border} backdrop-blur-sm animate-fade-in-up`}>
      <p className={`text-center font-bold text-lg ${style.text} flex items-center justify-center gap-3`}>
        {(type === 'success' || type === 'error') ? (
          <Image
            src={type === 'success' ? '/assets/icon-success.png' : '/assets/icon-error.png'}
            alt={type}
            width={32}
            height={32}
            className="object-contain"
          />
        ) : (
          <span className="text-2xl">{style.icon}</span>
        )}
        {message}
      </p>
    </div>
  );
}
