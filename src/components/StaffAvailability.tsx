import React, { useState } from 'react';
import {
  CalendarClock,
  Calendar,
  Check,
  X,
  Plus,
  Trash2,
  Save,
  Users,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { InHouseStaff } from '../types';

interface StaffAvailabilityProps {
  inHouseStaff: InHouseStaff[];
  onUpdateStaffAvailability: (updatedStaff: InHouseStaff[]) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StaffAvailability: React.FC<StaffAvailabilityProps> = ({
  inHouseStaff,
  onUpdateStaffAvailability,
}) => {
  const [staffList, setStaffList] = useState<InHouseStaff[]>(inHouseStaff);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(inHouseStaff[0]?.id || '');
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Toggle available day (0..6)
  const handleToggleDay = (staffId: string, dayIndex: number) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const exists = s.availableDays.includes(dayIndex);
        const updatedDays = exists
          ? s.availableDays.filter((d) => d !== dayIndex)
          : [...s.availableDays, dayIndex].sort();
        return { ...s, availableDays: updatedDays };
      })
    );
    setHasChanges(true);
  };

  // Add blackout date
  const handleAddBlackoutDate = (staffId: string) => {
    if (!newBlackoutDate) return;
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        if (s.blackoutDates.includes(newBlackoutDate)) return s;
        return { ...s, blackoutDates: [...s.blackoutDates, newBlackoutDate] };
      })
    );
    setNewBlackoutDate('');
    setHasChanges(true);
  };

  // Remove blackout date
  const handleRemoveBlackoutDate = (staffId: string, dateStr: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        return {
          ...s,
          blackoutDates: s.blackoutDates.filter((d) => d !== dateStr),
        };
      })
    );
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    onUpdateStaffAvailability(staffList);
    setHasChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const activeStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <CalendarClock className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Staff Availability & Blackout Calendar
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure employee working day preferences and approved leave dates. The 1-click Auto-Scheduler strictly honors these constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={!hasChanges}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Availability Changes</span>
          </button>
        </div>
      </div>

      {/* Main Availability Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Weekly Availability Matrix (Monday - Sunday)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Employee</th>
                <th className="pb-3 text-center">Employment</th>
                <th className="pb-3 text-center">Target (h/wk)</th>
                {DAYS.map((d) => (
                  <th key={d} className="pb-3 text-center">
                    {d}
                  </th>
                ))}
                <th className="pb-3 text-center">Available Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {staffList.map((staff) => {
                const availableCount = staff.availableDays.length;

                return (
                  <tr
                    key={staff.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      selectedStaffId === staff.id ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 pl-2">
                      <button
                        onClick={() => setSelectedStaffId(staff.id)}
                        className="flex items-center gap-2.5 text-left focus:outline-none"
                      >
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {staff.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{staff.role}</p>
                        </div>
                      </button>
                    </td>

                    <td className="py-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {staff.employmentType}
                      </span>
                    </td>

                    <td className="py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {staff.weeklyTargetHours}h
                    </td>

                    {/* Checkboxes for 7 days */}
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                      const isAvailable = staff.availableDays.includes(dayIdx);

                      return (
                        <td key={dayIdx} className="py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDay(staff.id, dayIdx)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Toggle ${DAYS[dayIdx]} for ${staff.name}`}
                          >
                            {isAvailable ? <Check className="w-3.5 h-3.5" /> : '—'}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {availableCount} / 7 days
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blackout Dates / Approved Leave Drawer per staff */}
      {activeStaff && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Blackout Dates & Approved Leave for {activeStaff.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dates when this employee cannot be rostered due to MC, pre-approved leave, or exams.
              </p>
            </div>

            {/* Quick add date input */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newBlackoutDate}
                onChange={(e) => setNewBlackoutDate(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-mono"
              />
              <button
                onClick={() => handleAddBlackoutDate(activeStaff.id)}
                disabled={!newBlackoutDate}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Date
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {activeStaff.blackoutDates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No active blackout dates registered for {activeStaff.name}. Fully available on configured weekdays.
              </p>
            ) : (
              activeStaff.blackoutDates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs font-mono font-semibold text-rose-800 dark:text-rose-200"
                >
                  <span>{date}</span>
                  <button
                    onClick={() => handleRemoveBlackoutDate(activeStaff.id, date)}
                    className="p-0.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                    title="Remove blackout date"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
