'use client';

import { useState, KeyboardEvent, useRef } from 'react';

interface WordInputProps {
  onSubmit: (word: string) => void;
  disabled?: boolean;
  currentLength: number;
}

export default function WordInput({ onSubmit, disabled, currentLength }: WordInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.length === currentLength && !disabled) {
      onSubmit(trimmed);
      setInput('');
      // Keep focus on input so keyboard stays open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-lg">
      <div className="relative flex-1 group">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            const value = e.target.value.toLowerCase().replace(/[^a-z]/gi, '');
            if (value.length <= currentLength) {
              setInput(value);
            }
          }}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={`Enter ${currentLength}-letter word`}
          className="w-full px-4 py-3 text-xl md:text-2xl text-center font-bold glass rounded-2xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-slate-500 transition-all duration-300"
          style={{
            '--tw-ring-color': 'color-mix(in srgb, var(--primary) 50%, transparent)',
          } as React.CSSProperties}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '';
          }}
          maxLength={currentLength}
          autoFocus
        />
        <div className="absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none" style={{
          background: 'linear-gradient(to right, transparent, transparent, transparent)'
        }}></div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || input.length !== currentLength}
        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white font-bold text-xl md:text-2xl rounded-2xl disabled:cursor-not-allowed transition-all duration-300 shadow-lg disabled:shadow-none transform hover:scale-105 active:scale-95 flex-shrink-0"
        style={{
          background: disabled ? 'linear-gradient(to right, #334155, #334155, #334155)' : `linear-gradient(to right, var(--primary), var(--secondary), var(--accent))`,
          boxShadow: disabled ? 'none' : undefined
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.filter = 'brightness(1.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'brightness(1)';
        }}
        aria-label="Submit word"
      >
        Go
      </button>
    </div>
  );
}
