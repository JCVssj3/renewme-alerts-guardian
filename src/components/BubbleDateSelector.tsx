
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BubbleDateSelectorProps {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
}

const BubbleDateSelector: React.FC<BubbleDateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const [step, setStep] = useState<'year' | 'month' | 'day'>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(selectedDate?.getFullYear() || null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(selectedDate?.getMonth() || null);
  const [selectedDay, setSelectedDay] = useState<number | null>(selectedDate?.getDate() || null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep('month');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setStep('day');
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    if (selectedYear && selectedMonth !== null) {
      const newDate = new Date(selectedYear, selectedMonth, day);
      onDateChange(newDate);
      setStep('year'); // Reset for next selection
    }
  };

  const goBack = () => {
    if (step === 'month') setStep('year');
    if (step === 'day') setStep('month');
  };

  const formatSelectedDate = () => {
    if (selectedDate) {
      return selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Select date';
  };

  return (
    <div className="space-y-4">
      {/* Display selected date */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Date</div>
        <div className="font-medium text-gray-800 dark:text-gray-200">
          {formatSelectedDate()}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-4">
        {step !== 'year' && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mobile-tap">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {step === 'year' && 'Select Year'}
            {step === 'month' && `Select Month for ${selectedYear}`}
            {step === 'day' && `Select Day for ${months[selectedMonth!]} ${selectedYear}`}
          </span>
        </div>
        <div style={{ width: step !== 'year' ? 'auto' : '0' }}></div>
      </div>

      {/* Year selection */}
      {step === 'year' && (
        <div className="grid grid-cols-4 gap-3">
          {years.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? 'default' : 'outline'}
              className="mobile-tap h-12 text-sm font-medium"
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      )}

      {/* Month selection */}
      {step === 'month' && (
        <div className="grid grid-cols-3 gap-3">
          {months.map((month, index) => (
            <Button
              key={month}
              variant={selectedMonth === index ? 'default' : 'outline'}
              className="mobile-tap h-12 text-sm font-medium"
              onClick={() => handleMonthSelect(index)}
            >
              {month}
            </Button>
          ))}
        </div>
      )}

      {/* Day selection */}
      {step === 'day' && selectedYear && selectedMonth !== null && (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? 'default' : 'outline'}
              className="mobile-tap h-10 text-sm font-medium aspect-square"
              onClick={() => handleDaySelect(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      )}

      {/* Reset button */}
      {selectedDate && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mobile-tap text-gray-600 dark:text-gray-400"
          onClick={() => {
            setSelectedYear(null);
            setSelectedMonth(null);
            setSelectedDay(null);
            setStep('year');
          }}
        >
          Clear Selection
        </Button>
      )}
    </div>
  );
};

export default BubbleDateSelector;
