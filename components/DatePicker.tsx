'use client';

import { useState, useEffect } from 'react';

interface DatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  minDate?: string; // Optional minimum selectable date
  maxDate?: string; // Today (no future dates)
}

export default function DatePicker({ 
  selectedDate, 
  onDateChange, 
  minDate,
  maxDate 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate);
  const [earliestDate, setEarliestDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const maxSelectableDate = maxDate || today;
  
  // Fetch earliest available date from API
  useEffect(() => {
    fetch('/api/challenges/date-range')
      .then(res => res.json())
      .then(data => {
        if (data.earliestDate) {
          setEarliestDate(data.earliestDate);
        }
      })
      .catch(err => {
        console.error('Error fetching date range:', err);
        // Fallback to provided minDate or reasonable default
      });
  }, []);

  const minSelectableDate = minDate || earliestDate || '2024-01-01'; // Use fetched earliest date or fallback

  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    if (tempDate >= minSelectableDate && tempDate <= maxSelectableDate) {
      onDateChange(tempDate);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    setIsOpen(false);
  };

  return (
    <>
      {/* Date Picker Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="glass px-4 py-2 rounded-xl border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 flex items-center gap-2 group"
        title="Select a different date"
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-slate-300 group-hover:text-slate-100 transition-colors"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="text-slate-200 font-medium">
          {formatDateForDisplay(selectedDate)}
        </span>
        {selectedDate === today && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            Today
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-up">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
          />
          
          {/* Modal Content */}
          <div className="relative glass rounded-3xl p-8 max-w-md w-full">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors"
            >
              ×
            </button>

            <h2 className="text-2xl font-black text-gradient mb-6">Select Date</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  Choose a date to play
                </label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={handleDateChange}
                  min={minSelectableDate}
                  max={maxSelectableDate}
                  className="w-full px-4 py-3 rounded-xl glass border border-slate-600/40 focus:border-slate-500/60 focus:outline-none text-slate-200 bg-slate-800/40 transition-all"
                />
                <p className="text-xs text-slate-400 mt-2">
                  You can play puzzles from previous dates. Future dates are not available.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-600/40 text-slate-300 hover:bg-slate-700/50 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={tempDate < minSelectableDate || tempDate > maxSelectableDate}
                  className="flex-1 px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(to right, var(--primary), var(--secondary))'
                  }}
                >
                  Load Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

