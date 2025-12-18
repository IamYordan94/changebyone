'use client';

import WordDisplay from './WordDisplay';

interface TargetWordProps {
  word: string;
}

export default function TargetWord({ word }: TargetWordProps) {
  return (
    <div className="bg-slate-800/40 p-6 rounded-2xl border backdrop-blur-sm" style={{ borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}>
      <WordDisplay word={word} label="Target Word" />
    </div>
  );
}
