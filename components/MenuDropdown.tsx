'use client';

import { useState, useRef, useEffect } from 'react';

interface MenuDropdownProps {
    onShowRules: () => void;
    onShowLeaderboard: () => void;
    onShowDatePicker: () => void;
    onShowHint: () => void;
    onShowFAQ: () => void;
    onReset: () => void;
    canReset: boolean;
    canHint: boolean;
}

export default function MenuDropdown({
    onShowRules,
    onShowLeaderboard,
    onShowDatePicker,
    onShowHint,
    onShowFAQ,
    onReset,
    canReset,
    canHint,
}: MenuDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleItemClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            {/* Three-dot button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 sm:p-2.5 rounded-lg glass hover:bg-slate-700/50 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                aria-label="Menu"
            >
                <svg
                    width="20"
                    height="20"
                    className="sm:w-6 sm:h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 glass rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in-up border border-slate-700/30">
                    <div className="py-1 sm:py-2">
                        <button
                            onClick={() => handleItemClick(onShowRules)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                        >
                            <span className="text-lg sm:text-xl flex-shrink-0">📖</span>
                            <span className="font-medium">How to Play</span>
                        </button>

                        <button
                            onClick={() => handleItemClick(onShowHint)}
                            disabled={!canHint}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <span className="text-lg sm:text-xl flex-shrink-0">💡</span>
                            <span className="font-medium">Hint</span>
                        </button>

                        <button
                            onClick={() => handleItemClick(onReset)}
                            disabled={!canReset}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <span className="text-lg sm:text-xl flex-shrink-0">🔄</span>
                            <span className="font-medium">Reset Puzzle</span>
                        </button>

                        <div className="border-t border-slate-700/50 my-1 sm:my-2" />

                        <button
                            onClick={() => handleItemClick(onShowDatePicker)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                        >
                            <span className="text-lg sm:text-xl flex-shrink-0">📅</span>
                            <span className="font-medium">Previous Games</span>
                        </button>

                        <button
                            onClick={() => handleItemClick(onShowLeaderboard)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                        >
                            <span className="text-lg sm:text-xl flex-shrink-0">🏆</span>
                            <span className="font-medium">Leaderboard</span>
                        </button>

                        <button
                            onClick={() => handleItemClick(onShowFAQ)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                        >
                            <span className="text-lg sm:text-xl flex-shrink-0">❓</span>
                            <span className="font-medium">FAQ</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
