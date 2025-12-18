'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'steel-cream' as const, name: 'Ocean Breeze', colors: ['#F1FEC6', '#497FAB', '#25537E'] },
    { id: 'oxford-mustard' as const, name: 'Golden Night', colors: ['#F5D04C', '#001D3D', '#EBEBEB'] },
    { id: 'robin-timberwolf' as const, name: 'Tropical Mist', colors: ['#0487B7', '#05C0C9', '#E6DDD5'] },
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative">
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center gap-2"
        title="Change Theme"
      >
        {/* Paint Palette Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 glass rounded-xl p-2 shadow-2xl min-w-[200px] animate-fade-in-up">
          <div className="text-xs uppercase tracking-wider text-slate-400 px-3 py-2 font-semibold">
            Theme
          </div>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                theme === t.id
                  ? 'bg-slate-700/50'
                  : 'hover:bg-slate-700/30'
              }`}
            >
              <div className="flex gap-1">
                {t.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-slate-600"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-slate-200">{t.name}</div>
              </div>
              {theme === t.id && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

