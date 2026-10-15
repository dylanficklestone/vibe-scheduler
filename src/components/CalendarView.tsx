import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { Shift, PublicHoliday, ShiftRole } from '../types';
import { calculateManpowerShortage, getConfirmedAssignedCount } from '../utils/storage';

interface CalendarViewProps {
  shifts: Shift[];
  holidays: PublicHoliday[];
  onOpenAddShift: (dayIndex: number) => void;
  onShiftClick: (shift: Shift) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  shifts,
  holidays,
  onOpenAddShift,
  onShiftClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState('October 2026');

  // Days in October 2026 (Oct 1 to Oct 31, starting on Thursday)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Operations Calendar & Shift Distribution
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual month overview showing scheduled shifts, gazetted Singapore holidays, and staffing load.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentMonth}
            </span>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onOpenAddShift(0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Shift</span>
          </button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty padding days for Thursday start (Mon=0, Tue=1, Wed=2, Thu=3) */}
        <div className="min-h-24 p-2 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent" />
        <div className="min-h-24 p-2 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent" />
        <div className="min-h-24 p-2 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent" />

        {daysInMonth.map((dayNum) => {
          const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
          const isHoliday = holidays.some((h) => h.date === dateStr);
          const holidayObj = holidays.find((h) => h.date === dateStr);
          const dayShifts = shifts.filter((s) => s.dateStr === dateStr);
          const totalHours = dayShifts.reduce((acc, s) => acc + s.hours, 0);
          const hasShortage = dayShifts.some(
            (s) => calculateManpowerShortage(s) > 0 || s.status === 'urgent_needed'
          );

          // Day of week (0=Mon, ..., 6=Sun)
          const jsDate = new Date(2026, 9, dayNum);
          const dayIndex = (jsDate.getDay() + 6) % 7;

          return (
            <div
              key={dayNum}
              className={`min-h-28 p-2 rounded-xl border flex flex-col justify-between transition-all group ${
                isHoliday
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : hasShortage
                  ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {dayNum}
                </span>
                {dayShifts.length > 0 && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {totalHours}h
                  </span>
                )}
              </div>

              {/* Holiday marker */}
              {isHoliday && holidayObj && (
                <div className="my-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold truncate" title={holidayObj.localName}>
                  {holidayObj.localName}
                </div>
              )}

              {/* Shifts Preview Pills */}
              <div className="space-y-1 my-1 overflow-hidden">
                {dayShifts.slice(0, 2).map((shift) => (
                  <button
                    key={shift.id}
                    onClick={() => onShiftClick(shift)}
                    className="w-full text-left p-1 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-700 dark:text-slate-200 truncate font-medium transition-colors"
                  >
                    {shift.startTime} {shift.role}
                  </button>
                ))}
                {dayShifts.length > 2 && (
                  <span className="text-[9px] text-slate-400 block px-1">
                    +{dayShifts.length - 2} more
                  </span>
                )}
              </div>

              {/* Quick Add Shift button */}
              <button
                onClick={() => onOpenAddShift(dayIndex)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center py-0.5"
              >
                + Add Shift
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
