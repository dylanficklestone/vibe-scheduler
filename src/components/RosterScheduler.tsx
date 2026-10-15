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
  Search,
  CheckCircle2,
  UserCheck,
  Smartphone,
  LayoutGrid,
} from 'lucide-react';
import {
  Shift,
  InHouseStaff,
  AdHocWorker,
  ShiftRole,
  StoreProfile,
  PublicHoliday,
  StaffingStatus,
} from '../types';
import { calculateManpowerShortage, getConfirmedAssignedCount, getEffectiveShiftStatus } from '../utils/storage';

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
  onShiftClick: (shift: Shift) => void;
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
      { name: 'Monday', dateStr: '2026-11-09', displayDate: 'Nov 09', dayIndex: 0 },
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
      { name: 'Friday', dateStr: '2026-12-25', displayDate: 'Dec 25', dayIndex: 4 },
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
  onShiftClick,
  onAutoGenerateRoster,
  onOpenAdHocModal,
  onResetRoster,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAutoNotice, setShowAutoNotice] = useState(false);

  const activeWeek = WEEKS_CONFIG[selectedWeekKey];
  const weekKeys = Object.keys(WEEKS_CONFIG) as (keyof typeof WEEKS_CONFIG)[];
  const currentWeekIndex = weekKeys.indexOf(selectedWeekKey);

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      onSelectWeek(weekKeys[currentWeekIndex - 1]);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weekKeys.length - 1) {
      onSelectWeek(weekKeys[currentWeekIndex + 1]);
    }
  };

  const handleToday = () => {
    onSelectWeek('oct_standard');
  };

  // Filter shifts based on search, role, and staffing status
  const filteredShifts = shifts.filter((s) => {
    // Search query matches task name, role, notes, or assigned staff name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const taskMatches = (s.taskName || '').toLowerCase().includes(q);
      const roleMatches = s.role.toLowerCase().includes(q);
      const notesMatches = (s.notes || '').toLowerCase().includes(q);
      const staffMatches = inHouseStaff.some(
        (staff) => (s.assignedWorkerIds?.includes(staff.id) || s.assignedStaffId === staff.id) && staff.name.toLowerCase().includes(q)
      );
      if (!taskMatches && !roleMatches && !notesMatches && !staffMatches) return false;
    }

    if (roleFilter !== 'all' && s.role !== roleFilter) return false;

    if (statusFilter !== 'all') {
      const effStatus = getEffectiveShiftStatus(s);
      if (statusFilter === 'fully_staffed' && effStatus !== 'fully_staffed') return false;
      if (statusFilter === 'partially_staffed' && effStatus !== 'partially_staffed') return false;
      if (statusFilter === 'unfilled' && effStatus !== 'unfilled') return false;
      if (statusFilter === 'adhoc_assigned' && effStatus !== 'adhoc_assigned') return false;
    }

    return true;
  });

  // Overall metrics for the current visible shifts
  const totalHours = shifts.reduce((acc, s) => acc + s.hours, 0);
  const totalCost = shifts.reduce((acc, s) => {
    const fee = s.isAdHoc ? 4.5 : 0;
    return acc + s.hours * s.hourlyRate + fee;
  }, 0);
  const urgentCount = shifts.filter((s) => calculateManpowerShortage(s) > 0 || s.status === 'urgent_needed').length;
  const adHocCount = shifts.filter((s) => s.isAdHoc || s.assignedAdHocId).length;

  const handleRunAutoScheduler = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onAutoGenerateRoster();
      setIsGenerating(false);
      setShowAutoNotice(true);
      setTimeout(() => setShowAutoNotice(false), 4000);
    }, 450);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Auto-scheduler result notice if fired */}
      {showAutoNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Auto-Roster Completed:</strong> Optimal staff allocation generated based on in-house availability, skill requirements, and Singapore public holiday rules.
            </span>
          </div>
          <button
            onClick={() => setShowAutoNotice(false)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Week switcher, Search, Filters, Add Shift & Auto-schedule */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Week Selector & Today Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={handlePrevWeek}
                disabled={currentWeekIndex === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextWeek}
                disabled={currentWeekIndex === weekKeys.length - 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week Preset Dropdown */}
            <select
              value={selectedWeekKey}
              onChange={(e) => onSelectWeek(e.target.value as any)}
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[280px] sm:max-w-none truncate"
            >
              <option value="oct_standard">Week 43 · Oct 19 - Oct 25, 2026 (Standard)</option>
              <option value="nov_deepavali">Week 46 · Nov 09 - Nov 15, 2026 (Deepavali Week)</option>
              <option value="dec_christmas">Week 52 · Dec 21 - Dec 27, 2026 (Christmas Week)</option>
            </select>
          </div>

          {/* Action Buttons: Add Shift & Auto-Schedule */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddShift(0)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shift</span>
            </button>

            <button
              onClick={handleRunAutoScheduler}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-amber-500 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Solving...' : 'Auto-Schedule'}</span>
            </button>

            <button
              onClick={onResetRoster}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Roster to Sample Template"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shifts, tasks, staff, notes..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Barista">Barista</option>
            <option value="Cashier">Cashier</option>
            <option value="Kitchen / Cook">Kitchen / Cook</option>
            <option value="Floor Lead">Floor Lead</option>
            <option value="Retail Associate">Retail Associate</option>
            <option value="Inventory / Stock">Inventory / Stock</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Staffing Statuses</option>
            <option value="fully_staffed">Fully Staffed (Green)</option>
            <option value="partially_staffed">Partially Staffed (Amber)</option>
            <option value="unfilled">Unfilled Shortages (Red)</option>
            <option value="adhoc_assigned">Temp Worker Assigned (Blue)</option>
          </select>
        </div>
      </div>

      {/* Legend & Accessibility Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Status Key:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Fully Staffed</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Partially Staffed</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Unfilled Shortage</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Temporary Worker</span>
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          Total Scheduled: {totalHours.toFixed(1)}h · Est: ${Math.round(totalCost).toLocaleString()}
        </div>
      </div>

      {/* Mobile Day Selector (Tabs for screens < 1024px to prevent squeezing) */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {activeWeek.days.map((day) => {
          const isSelected = selectedMobileDay === day.dayIndex;
          const dayShiftsCount = filteredShifts.filter((s) => s.dayIndex === day.dayIndex).length;
          const hasShortage = filteredShifts.some(
            (s) => s.dayIndex === day.dayIndex && (calculateManpowerShortage(s) > 0 || s.status === 'urgent_needed')
          );

          return (
            <button
              key={day.dayIndex}
              onClick={() => setSelectedMobileDay(day.dayIndex)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{day.name.slice(0, 3)} {day.displayDate}</span>
              {hasShortage && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
            </button>
          );
        })}
      </div>

      {/* Desktop 7-Column Roster Grid */}
      <div className="hidden lg:grid grid-cols-7 gap-3 items-start">
        {activeWeek.days.map((day) => {
          const dayShifts = filteredShifts.filter((s) => s.dayIndex === day.dayIndex);
          const isHoliday = holidays.some((h) => h.date === day.dateStr);
          const holidayObj = holidays.find((h) => h.date === day.dateStr);
          const isWeekend = day.dayIndex === 5 || day.dayIndex === 6;

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl border flex flex-col min-h-[550px] transition-all ${
                isHoliday
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : isWeekend
                  ? 'border-indigo-100 dark:border-slate-800 bg-indigo-50/10 dark:bg-slate-900/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60'
              }`}
            >
              {/* Day Header */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {day.name.slice(0, 3)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {day.displayDate}
                    </span>
                  </div>
                  {isHoliday && (
                    <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded truncate max-w-[100px]" title={holidayObj?.localName}>
                      {holidayObj?.localName || 'Public Holiday'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAddShift(day.dayIndex)}
                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                  title={`Add Shift to ${day.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Shifts Container */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                {dayShifts.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-3 text-slate-400 dark:text-slate-600">
                    <span className="text-xs font-medium">No shifts</span>
                    <button
                      onClick={() => onAddShift(day.dayIndex)}
                      className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                ) : (
                  dayShifts.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      inHouseStaff={inHouseStaff}
                      adHocWorkers={adHocWorkers}
                      onClick={() => onShiftClick(shift)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Single Day View */}
      <div className="lg:hidden space-y-3">
        {(() => {
          const day = activeWeek.days[selectedMobileDay];
          const dayShifts = filteredShifts.filter((s) => s.dayIndex === selectedMobileDay);
          const isHoliday = holidays.some((h) => h.date === day.dateStr);
          const holidayObj = holidays.find((h) => h.date === day.dateStr);

          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {day.name} ({day.displayDate})
                    {isHoliday && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {holidayObj?.localName || 'Public Holiday'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dayShifts.length} scheduled shift{dayShifts.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  onClick={() => onAddShift(selectedMobileDay)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Shift
                </button>
              </div>

              <div className="space-y-3">
                {dayShifts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No shifts rostered for this day. Tap Add Shift above.
                  </div>
                ) : (
                  dayShifts.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      inHouseStaff={inHouseStaff}
                      adHocWorkers={adHocWorkers}
                      onClick={() => onShiftClick(shift)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// Reusable Shift Card Component with required fields and accessible status indicators
interface ShiftCardProps {
  shift: Shift;
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  onClick: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  inHouseStaff,
  adHocWorkers,
  onClick,
}) => {
  const shortage = calculateManpowerShortage(shift);
  const confirmedCount = getConfirmedAssignedCount(shift);
  const effectiveStatus = getEffectiveShiftStatus(shift);

  // Status Styling Configuration
  const statusStyles: Record<
    typeof effectiveStatus,
    {
      border: string;
      bg: string;
      badgeText: string;
      badgeClass: string;
      dot: string;
    }
  > = {
    fully_staffed: {
      border: 'border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400',
      bg: 'bg-white dark:bg-slate-900',
      badgeText: 'Fully Staffed',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    partially_staffed: {
      border: 'border-amber-200 dark:border-amber-800/60 hover:border-amber-400',
      bg: 'bg-amber-50/20 dark:bg-amber-950/10',
      badgeText: 'Partially Staffed',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    unfilled: {
      border: 'border-rose-300 dark:border-rose-800/70 hover:border-rose-500',
      bg: 'bg-rose-50/30 dark:bg-rose-950/20',
      badgeText: 'Unfilled Shortage',
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold',
      dot: 'bg-rose-500',
    },
    adhoc_assigned: {
      border: 'border-blue-200 dark:border-blue-800/60 hover:border-blue-400',
      bg: 'bg-blue-50/20 dark:bg-blue-950/10',
      badgeText: 'Temp Worker Assigned',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold',
      dot: 'bg-blue-500',
    },
  };

  const style = statusStyles[effectiveStatus];

  // Resolve assigned worker names
  const assignedWorkerIds = shift.assignedWorkerIds?.length
    ? shift.assignedWorkerIds
    : shift.assignedStaffId
    ? [shift.assignedStaffId]
    : shift.assignedAdHocId
    ? [shift.assignedAdHocId]
    : [];

  const assignedStaff = inHouseStaff.filter((s) => assignedWorkerIds.includes(s.id));
  const assignedAdHoc = adHocWorkers.filter((a) => assignedWorkerIds.includes(a.id));

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border ${style.border} ${style.bg} shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group select-none`}
    >
      {/* Top: Role & Accessible Status Badge */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {shift.taskName || shift.role}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {shift.role}
          </p>
        </div>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold shrink-0 flex items-center gap-1 ${style.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          <span>{style.badgeText}</span>
        </span>
      </div>

      {/* Timing and Duration */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          {shift.startTime} - {shift.endTime}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {shift.hours}h
        </span>
      </div>

      {/* Headcount Status & Worker Avatars */}
      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        {/* Headcount Indicator */}
        <span className="text-[11px] font-mono text-slate-500">
          Headcount: <strong className="text-slate-800 dark:text-slate-200">{confirmedCount}/{shift.requiredHeadcount}</strong>
        </span>

        {/* Worker Names / Avatars */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {assignedStaff.map((staff) => (
            <img
              key={staff.id}
              src={staff.avatar}
              alt={staff.name}
              title={`${staff.name} (In-House)`}
              className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
            />
          ))}
          {assignedAdHoc.map((adhoc) => (
            <img
              key={adhoc.id}
              src={adhoc.avatar}
              alt={adhoc.name}
              title={`${adhoc.name} (Ad-Hoc Casual)`}
              className="w-5 h-5 rounded-full ring-2 ring-blue-500 object-cover"
            />
          ))}
          {confirmedCount === 0 && (
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
              Needs Cover
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
