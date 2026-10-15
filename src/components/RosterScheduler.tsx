import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
  Info,
  CalendarDays,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Shift, InHouseStaff, AdHocWorker, ShiftRole, StoreProfile, PublicHoliday } from '../types';

interface RosterSchedulerProps {
  shifts: Shift[];
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  activeStore: StoreProfile;
  holidays: PublicHoliday[];
  holidaySource: string;
  selectedWeekKey: 'oct_standard' | 'nov_deepavali' | 'dec_christmas';
  onSelectWeek: (weekKey: 'oct_standard' | 'nov_deepavali' | 'dec_christmas') => void;
  onAddShift: (dayIndex: number) => void;
  onEditShift: (shift: Shift) => void;
  onAutoGenerateRoster: () => void;
  onOpenAdHocModal: (shift?: Shift) => void;
  onResetRoster: () => void;
}

export const WEEKS_CONFIG = {
  oct_standard: {
    label: 'Week 43 · Oct 19 - Oct 25, 2026 (Standard Operations)',
    year: 2026,
    days: [
      { name: 'Monday', dateStr: '2026-10-19', displayDate: 'Oct 19', dayIndex: 0 },
      { name: 'Tuesday', dateStr: '2026-10-20', displayDate: 'Oct 20', dayIndex: 1 },
      { name: 'Wednesday', dateStr: '2026-10-21', displayDate: 'Oct 21', dayIndex: 2 },
      { name: 'Thursday', dateStr: '2026-10-22', displayDate: 'Oct 22', dayIndex: 3 },
      { name: 'Friday', dateStr: '2026-10-23', displayDate: 'Oct 23', dayIndex: 4 },
      { name: 'Saturday', dateStr: '2026-10-24', displayDate: 'Oct 24', dayIndex: 5 },
      { name: 'Sunday', dateStr: '2026-10-25', displayDate: 'Oct 25', dayIndex: 6 },
    ],
  },
  nov_deepavali: {
    label: 'Week 46 · Nov 09 - Nov 15, 2026 (Deepavali Holiday Week)',
    year: 2026,
    days: [
      { name: 'Monday', dateStr: '2026-11-09', displayDate: 'Nov 09', dayIndex: 0 }, // Deepavali!
      { name: 'Tuesday', dateStr: '2026-11-10', displayDate: 'Nov 10', dayIndex: 1 },
      { name: 'Wednesday', dateStr: '2026-11-11', displayDate: 'Nov 11', dayIndex: 2 },
      { name: 'Thursday', dateStr: '2026-11-12', displayDate: 'Nov 12', dayIndex: 3 },
      { name: 'Friday', dateStr: '2026-11-13', displayDate: 'Nov 13', dayIndex: 4 },
      { name: 'Saturday', dateStr: '2026-11-14', displayDate: 'Nov 14', dayIndex: 5 },
      { name: 'Sunday', dateStr: '2026-11-15', displayDate: 'Nov 15', dayIndex: 6 },
    ],
  },
  dec_christmas: {
    label: 'Week 52 · Dec 21 - Dec 27, 2026 (Christmas Holiday Week)',
    year: 2026,
    days: [
      { name: 'Monday', dateStr: '2026-12-21', displayDate: 'Dec 21', dayIndex: 0 },
      { name: 'Tuesday', dateStr: '2026-12-22', displayDate: 'Dec 22', dayIndex: 1 },
      { name: 'Wednesday', dateStr: '2026-12-23', displayDate: 'Dec 23', dayIndex: 2 },
      { name: 'Thursday', dateStr: '2026-12-24', displayDate: 'Dec 24', dayIndex: 3 },
      { name: 'Friday', dateStr: '2026-12-25', displayDate: 'Dec 25', dayIndex: 4 }, // Christmas Day!
      { name: 'Saturday', dateStr: '2026-12-26', displayDate: 'Dec 26', dayIndex: 5 },
      { name: 'Sunday', dateStr: '2026-12-27', displayDate: 'Dec 27', dayIndex: 6 },
    ],
  },
};

export const RosterScheduler: React.FC<RosterSchedulerProps> = ({
  shifts,
  inHouseStaff,
  adHocWorkers,
  activeStore,
  holidays,
  holidaySource,
  selectedWeekKey,
  onSelectWeek,
  onAddShift,
  onEditShift,
  onAutoGenerateRoster,
  onOpenAdHocModal,
  onResetRoster,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAutoNotice, setShowAutoNotice] = useState(false);
  const [showHolidayDirectory, setShowHolidayDirectory] = useState(false);

  const activeWeek = WEEKS_CONFIG[selectedWeekKey];

  // Filter shifts
  const filteredShifts = shifts.filter((s) => {
    if (roleFilter !== 'all' && s.role !== roleFilter) return false;
    if (fulfillmentFilter === 'urgent' && s.status !== 'urgent_needed') return false;
    if (fulfillmentFilter === 'adhoc' && !s.isAdHoc) return false;
    if (fulfillmentFilter === 'in_house' && (s.isAdHoc || s.status === 'urgent_needed')) return false;
    return true;
  });

  // Calculate metrics
  const totalHours = shifts.reduce((acc, s) => acc + s.hours, 0);
  const totalCost = shifts.reduce((acc, s) => {
    const fee = s.isAdHoc ? 4.5 : 0;
    return acc + s.hours * s.hourlyRate + fee;
  }, 0);
  const urgentCount = shifts.filter((s) => s.status === 'urgent_needed').length;
  const adHocCount = shifts.filter((s) => s.isAdHoc).length;

  const handleRunAutoScheduler = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onAutoGenerateRoster();
      setIsGenerating(false);
      setShowAutoNotice(true);
      setTimeout(() => setShowAutoNotice(false), 4000);
    }, 600);
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return null;
    return inHouseStaff.find((s) => s.id === staffId)?.name || 'In-House Staff';
  };

  const getAdHocWorker = (workerId?: string) => {
    if (!workerId) return null;
    return adHocWorkers.find((w) => w.id === workerId) || null;
  };

  const getHolidayForDate = (dateStr: string) => {
    return holidays.find((h) => h.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Store Operational Context & BMC Value Proposition */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Weekly Roster & Shift Operations
              </h1>

              {/* Week Selector Dropdown */}
              <select
                value={selectedWeekKey}
                onChange={(e) => onSelectWeek(e.target.value as any)}
                className="text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="oct_standard">Week 43 · Oct 19 - Oct 25 (Standard Week)</option>
                <option value="nov_deepavali">Week 46 · Nov 09 - Nov 15 (Deepavali Holiday)</option>
                <option value="dec_christmas">Week 52 · Dec 21 - Dec 27 (Christmas Holiday)</option>
              </select>

              {/* Nager.Date Serverless API Live Indicator */}
              <button
                onClick={() => setShowHolidayDirectory(true)}
                title="View live public holidays from Nager.Date"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md transition-colors cursor-pointer"
              >
                <Globe className="w-3 h-3 text-amber-600" />
                <span>Nager.Date API Connected ({holidays.length} SG Holidays)</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              1-Store manpower schedule for <strong className="text-slate-800">{activeStore.name}</strong>.
              Auto-generate optimal shifts matching in-house availability, accounting for public holidays from Nager.Date, and tap the contract casual pool for shortage cover.
            </p>
          </div>

          {/* Action cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAutoScheduler}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'text-amber-400'}`} />
              <span>{isGenerating ? 'Generating Roster...' : 'Auto-Schedule Roster'}</span>
            </button>

            <button
              onClick={() => onOpenAdHocModal()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Tap Casual Pool</span>
            </button>

            <button
              onClick={onResetRoster}
              title="Reset to default demo roster"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Auto notice */}
        {showAutoNotice && (
          <div className="mt-3 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Auto-Roster Complete:</strong> In-house availability, target hours, and public holiday premium constraints balanced.
              </span>
            </div>
            <button
              onClick={() => setShowAutoNotice(false)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Total Scheduled Hours</span>
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {totalHours.toFixed(1)} hrs
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Estimated Store Payroll</span>
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              ${totalCost.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Ad-Hoc Casual Deployed</span>
            <span className="text-base font-bold text-amber-700 font-mono tabular-nums">
              {adHocCount} shifts
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Urgent Cover Needed</span>
            <span className={`text-base font-bold font-mono tabular-nums ${urgentCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {urgentCount} shifts
            </span>
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">Filter by Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Barista">Barista</option>
            <option value="Cashier">Cashier</option>
            <option value="Kitchen / Cook">Kitchen / Cook</option>
            <option value="Floor Lead">Floor Lead</option>
            <option value="Retail Associate">Retail Associate</option>
            <option value="Inventory / Stock">Inventory / Stock</option>
          </select>
        </div>

        {/* Fulfillment segmented buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFulfillmentFilter('all')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              fulfillmentFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Shifts ({shifts.length})
          </button>
          <button
            onClick={() => setFulfillmentFilter('in_house')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              fulfillmentFilter === 'in_house'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In-House Staff
          </button>
          <button
            onClick={() => setFulfillmentFilter('adhoc')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              fulfillmentFilter === 'adhoc'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ad-Hoc Pool ({adHocCount})
          </button>
          <button
            onClick={() => setFulfillmentFilter('urgent')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              fulfillmentFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Shortages ({urgentCount})
          </button>
        </div>
      </div>

      {/* 7-Day Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {activeWeek.days.map((day) => {
          const dayShifts = filteredShifts
            .filter((s) => s.dayIndex === day.dayIndex)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const dayHours = dayShifts.reduce((acc, s) => acc + s.hours, 0);
          const hasUrgent = dayShifts.some((s) => s.status === 'urgent_needed');
          const holidayInfo = getHolidayForDate(day.dateStr);

          return (
            <div
              key={day.dayIndex}
              className={`bg-white rounded-xl border flex flex-col min-h-[460px] transition-shadow ${
                hasUrgent
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : holidayInfo
                  ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b flex items-center justify-between rounded-t-xl ${
                  holidayInfo
                    ? 'bg-amber-100/70 border-amber-200'
                    : 'bg-slate-50/50 border-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{day.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {day.displayDate} · {dayHours}h
                  </div>
                </div>
                <button
                  onClick={() => onAddShift(day.dayIndex)}
                  title={`Add shift on ${day.name}`}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Public Holiday Banner if matching live Nager.Date holiday */}
              {holidayInfo && (
                <div className="py-1.5 px-2 bg-amber-500 text-white text-[10px] font-bold tracking-tight text-center flex items-center justify-center gap-1">
                  <span>★ Public Holiday: {holidayInfo.name}</span>
                </div>
              )}

              {/* Shifts list for this day */}
              <div className="p-2 space-y-2 flex-1 flex flex-col justify-start">
                {dayShifts.length === 0 ? (
                  <div className="text-center py-8 px-2 flex-1 flex flex-col items-center justify-center">
                    <p className="text-[11px] text-slate-400">No shifts scheduled</p>
                    <button
                      onClick={() => onAddShift(day.dayIndex)}
                      className="mt-2 text-[11px] text-slate-600 hover:text-slate-900 font-medium underline"
                    >
                      + Add Shift
                    </button>
                  </div>
                ) : (
                  dayShifts.map((shift) => {
                    const staffName = getStaffName(shift.assignedStaffId);
                    const adHocWorker = getAdHocWorker(shift.assignedAdHocId);
                    const isUrgent = shift.status === 'urgent_needed';

                    return (
                      <div
                        key={shift.id}
                        onClick={() => onEditShift(shift)}
                        className={`group relative p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-xs ${
                          isUrgent
                            ? 'bg-rose-50/70 border-rose-300 hover:border-rose-400'
                            : shift.isAdHoc
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Top row: Role & Time */}
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate">
                            {shift.role}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {shift.hours}h
                          </span>
                        </div>

                        {/* Shift hours */}
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          {shift.startTime} – {shift.endTime}
                        </div>

                        {/* Public Holiday badge if on PH */}
                        {holidayInfo && (
                          <div className="text-[10px] text-amber-700 font-semibold mt-1">
                            PH Premium Rate Applies
                          </div>
                        )}

                        {/* Assignee display */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          {isUrgent ? (
                            <div className="w-full">
                              <div className="flex items-center gap-1 text-rose-700 font-semibold">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>Unfilled Shortage!</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAdHocModal(shift);
                                }}
                                className="mt-1.5 w-full flex items-center justify-center gap-1 py-1 px-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded text-[10px] transition-colors"
                              >
                                <Zap className="w-2.5 h-2.5" />
                                <span>Tap Ready Pool</span>
                              </button>
                            </div>
                          ) : shift.isAdHoc && adHocWorker ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between text-amber-900 font-medium">
                                <span className="truncate">{adHocWorker.name}</span>
                                <span className="text-[10px] text-amber-700 font-mono">
                                  {adHocWorker.rating}★
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-700">
                                Contract Casual · ${shift.hourlyRate}/h
                              </div>
                            </div>
                          ) : staffName ? (
                            <div className="w-full flex items-center justify-between">
                              <span className="text-slate-800 font-medium truncate">
                                {staffName}
                              </span>
                              <span className="text-slate-400 text-[10px] font-mono">
                                In-house
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Open shift</span>
                          )}
                        </div>

                        {/* Notes snippet if any */}
                        {shift.notes && (
                          <div className="mt-1 text-[10px] text-slate-500 truncate" title={shift.notes}>
                            {shift.notes}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Day footer */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/40 rounded-b-xl text-center">
                <button
                  onClick={() => onAddShift(day.dayIndex)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  + Add Shift
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nager.Date Public Holidays Directory Modal */}
      {showHolidayDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Singapore 2026 Gazetted Public Holidays
                </h3>
              </div>
              <button
                onClick={() => setShowHolidayDirectory(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
              <div>Endpoint: <code className="text-slate-900 font-bold">GET https://date.nager.at/api/v3/PublicHolidays/2026/SG</code></div>
              <div>Serverless Gateway: <code className="text-slate-900 font-bold">/api/holiday?year=2026&country=SG</code></div>
              <div>Live Source: <span className="text-emerald-700 font-semibold">{holidaySource}</span></div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {holidays.map((h) => {
                const isOctOrNov = h.date.includes('2026-11') || h.date.includes('2026-12');
                return (
                  <div key={h.date} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{h.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {h.date} · {h.localName}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                      Gazetted
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHolidayDirectory(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
