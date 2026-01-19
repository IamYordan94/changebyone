'use client';

import { useState, useEffect } from 'react';

interface DatePickerModalProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  minDate?: string; // Optional minimum selectable date
  maxDate?: string; // Today (no future dates)
}

export default function DatePickerModal({ 
  selectedDate, 
  onDateChange, 
  minDate,
  maxDate 
}: DatePickerModalProps) {
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

  // Update tempDate when selectedDate changes
  useEffect(() => {
    setTempDate(selectedDate);
  }, [selectedDate]);

  const minSelectableDate = minDate || earliestDate || '2024-01-01'; // Use fetched earliest date or fallback

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    if (tempDate >= minSelectableDate && tempDate <= maxSelectableDate) {
      onDateChange(tempDate);
    }
  };

  const isDateValid = tempDate >= minSelectableDate && tempDate <= maxSelectableDate;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-slate-300 mb-2 font-medium text-sm sm:text-base">
          Choose a date to play
        </label>
        <input
          type="date"
          value={tempDate}
          onChange={handleDateChange}
          min={minSelectableDate}
          max={maxSelectableDate}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl glass border border-slate-600/40 focus:border-slate-500/60 focus:outline-none text-slate-200 bg-slate-800/40 transition-all text-sm sm:text-base"
        />
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          You can play puzzles from previous dates. Future dates are not available.
        </p>
        {!isDateValid && tempDate && (
          <p className="text-xs sm:text-sm text-red-400 mt-2">
            Please select a valid date between {minSelectableDate} and {maxSelectableDate}
          </p>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
        <button
          onClick={() => onDateChange(selectedDate)}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-slate-600/40 text-slate-300 hover:bg-slate-700/50 transition-all duration-300 font-medium text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isDateValid}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
          style={{
            background: 'linear-gradient(to right, var(--primary), var(--secondary))'
          }}
        >
          Load Date
        </button>
      </div>
    </div>
  );
}
