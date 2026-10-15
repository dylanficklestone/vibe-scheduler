import React from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Zap,
  Activity,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import {
  Shift,
  InHouseStaff,
  AdHocWorker,
  StoreProfile,
  PublicHoliday,
  ActivityItem,
  NavTab,
} from '../types';
import { calculateManpowerShortage, getConfirmedAssignedCount } from '../utils/storage';

interface DashboardProps {
  shifts: Shift[];
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  activeStore: StoreProfile;
  holidays: PublicHoliday[];
  activities: ActivityItem[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenAddShift: () => void;
  onFindReplacementForShift: (shift: Shift) => void;
  onAutoGenerateRoster: () => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const Dashboard: React.FC<DashboardProps> = ({
  shifts,
  inHouseStaff,
  adHocWorkers,
  activeStore,
  holidays,
  activities,
  onNavigateTab,
  onOpenAddShift,
  onFindReplacementForShift,
  onAutoGenerateRoster,
}) => {
  // --- Calculate 6 KPIs dynamically from real records ---
  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((acc, s) => acc + s.hours, 0);

  // Total required vs confirmed headcount
  const totalRequiredHeadcount = shifts.reduce((acc, s) => acc + (s.requiredHeadcount || 1), 0);
  const totalConfirmedHeadcount = shifts.reduce((acc, s) => acc + getConfirmedAssignedCount(s), 0);

  const coveragePercentage =
    totalRequiredHeadcount > 0
      ? Math.min(100, Math.round((totalConfirmedHeadcount / totalRequiredHeadcount) * 100))
      : 100;

  // Open shortages
  const shortageShifts = shifts.filter((s) => calculateManpowerShortage(s) > 0 || s.status === 'urgent_needed');
  const totalShortageCount = shifts.reduce((acc, s) => acc + calculateManpowerShortage(s), 0);

  // Temporary workers assigned
  const adHocShiftsCount = shifts.filter(
    (s) => s.isAdHoc || s.assignedAdHocId || (s.assignedWorkerIds && s.assignedWorkerIds.some((id) => id.startsWith('adhoc_')))
  ).length;

  // Estimated labour cost
  const estimatedCost = shifts.reduce((acc, s) => {
    const isTemp = s.isAdHoc || (s.assignedWorkerIds && s.assignedWorkerIds.some((id) => id.startsWith('adhoc_')));
    const placementFee = isTemp ? 4.5 : 0;
    return acc + s.hours * (s.hourlyRate || 18) + placementFee;
  }, 0);

  // --- Day-by-Day Coverage Breakdown for Chart ---
  const dailyCoverage = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
    const dayShifts = shifts.filter((s) => s.dayIndex === dayIdx);
    const required = dayShifts.reduce((acc, s) => acc + (s.requiredHeadcount || 1), 0);
    const confirmed = dayShifts.reduce((acc, s) => acc + getConfirmedAssignedCount(s), 0);
    const shortage = Math.max(required - confirmed, 0);
    return {
      dayIndex: dayIdx,
      dayName: DAY_NAMES[dayIdx],
      required,
      confirmed,
      shortage,
      shiftCount: dayShifts.length,
    };
  });

  const maxDayHeadcount = Math.max(...dailyCoverage.map((d) => d.required), 6);

  // Next 5 scheduled shifts (sorted by dayIndex and startTime)
  const upcomingShifts = [...shifts]
    .sort((a, b) => a.dayIndex - b.dayIndex || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  // Upcoming Singapore public holidays (filter for current or next few upcoming)
  const upcomingHolidays = holidays.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <Store className="w-3.5 h-3.5 text-indigo-300" />
              <span>{activeStore.name}</span>
              <span className="text-white/40">·</span>
              <span className="text-indigo-100">{activeStore.type}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Workforce Operations & Roster Command
            </h1>
            <p className="text-sm text-indigo-100/80 max-w-2xl">
              Manage single-outlet manpower rosters, monitor live shift coverage, dispatch contract staff, and calculate weekly payroll.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAddShift}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Create Shift</span>
            </button>
            <button
              onClick={onAutoGenerateRoster}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white border border-indigo-400/30 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Auto-Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Card 1: Total Scheduled Shifts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Scheduled Shifts</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalShifts}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across 7 operational days</p>
        </div>

        {/* Card 2: Total Scheduled Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Hours</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalHours.toFixed(1)}h
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avg {(totalHours / 7).toFixed(1)}h / day
          </p>
        </div>

        {/* Card 3: Staffing Coverage Percentage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Staffing Coverage</span>
            <div className={`p-1.5 rounded-lg ${
              coveragePercentage >= 90
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {coveragePercentage}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                coveragePercentage >= 90 ? 'bg-emerald-500' : coveragePercentage >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${coveragePercentage}%` }}
            />
          </div>
        </div>

        {/* Card 4: Open Manpower Shortages */}
        <div className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-2xs transition-all ${
          totalShortageCount > 0
            ? 'border-rose-300 dark:border-rose-800/70 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Open Shortages</span>
            <div className={`p-1.5 rounded-lg ${
              totalShortageCount > 0
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${
            totalShortageCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {totalShortageCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {totalShortageCount > 0 ? 'Requires immediate cover' : 'Zero unfilled gaps'}
          </p>
        </div>

        {/* Card 5: Temporary Workers Assigned */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Temp Workers</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {adHocShiftsCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Contract casual hires</p>
        </div>

        {/* Card 6: Estimated Labour Cost */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Labour Cost</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ${Math.round(estimatedCost).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Budget: ${activeStore.weeklyTargetBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Grid: Coverage Chart + Urgent Staffing Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Weekly Manpower Coverage Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Weekly Manpower Coverage Analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Headcount requirement vs confirmed staff assigned across Monday to Sunday
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" /> Confirmed ({totalConfirmedHeadcount})
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Shortage ({totalShortageCount})
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              {dailyCoverage.map((day) => {
                const confirmedHeight = (day.confirmed / maxDayHeadcount) * 100;
                const shortageHeight = (day.shortage / maxDayHeadcount) * 100;
                const isShortage = day.shortage > 0;

                return (
                  <div key={day.dayName} className="flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[42px] flex flex-col justify-end h-full gap-0.5">
                      {/* Shortage portion */}
                      {day.shortage > 0 && (
                        <div
                          style={{ height: `${Math.max(shortageHeight, 10)}%` }}
                          className="w-full bg-rose-500 rounded-t-sm transition-all relative"
                          title={`${day.shortage} worker shortage`}
                        />
                      )}
                      {/* Confirmed portion */}
                      <div
                        style={{ height: `${Math.max(confirmedHeight, 8)}%` }}
                        className={`w-full ${
                          day.shortage > 0 ? 'bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600'
                        } ${day.shortage === 0 ? 'rounded-t-sm' : ''} rounded-b-xs transition-all`}
                        title={`${day.confirmed} confirmed staff`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Labels and Sub-stats */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
              {dailyCoverage.map((day) => (
                <div key={day.dayName} className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {day.dayName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                    {day.confirmed}/{day.required}
                  </span>
                  {day.shortage > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                      -{day.shortage}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Total required headcount: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{totalRequiredHeadcount}</strong> · Confirmed: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{totalConfirmedHeadcount}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('roster')}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Full Roster <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Widget 2: Urgent Staffing Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Urgent Staffing Alerts</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {shortageShifts.length}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Shifts facing immediate manpower deficit. Tap Find Replacement to dispatch vetted casuals.
            </p>

            <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
              {shortageShifts.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    All Shifts Fully Staffed
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    No open absences or unfilled slots currently pending.
                  </p>
                </div>
              ) : (
                shortageShifts.map((shift) => {
                  const shortage = calculateManpowerShortage(shift);
                  return (
                    <div
                      key={shift.id}
                      className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                              {shift.taskName || shift.role}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-600 text-white rounded-full">
                              Short: {shortage || 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {shift.dateStr} · {shift.startTime} - {shift.endTime} ({shift.hours}h)
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          ${shift.hourlyRate}/h
                        </span>
                      </div>

                      {shift.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-1">
                          "{shift.notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">
                          Assigned: {getConfirmedAssignedCount(shift)} / {shift.requiredHeadcount}
                        </span>
                        <button
                          onClick={() => onFindReplacementForShift(shift)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>Find Replacement</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => onNavigateTab('emergency')}
              className="w-full py-2 px-3 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Open Emergency Dispatch Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Secondary Widgets: Upcoming Shifts, Public Holidays, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 3: Upcoming Shifts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Upcoming Shifts
            </h3>
            <button
              onClick={() => onNavigateTab('roster')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingShifts.map((shift) => {
              const assigned = inHouseStaff.find((s) => s.id === shift.assignedStaffId);
              const adHoc = adHocWorkers.find((a) => a.id === shift.assignedAdHocId);
              return (
                <div
                  key={shift.id}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {shift.taskName || shift.role}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {DAY_NAMES[shift.dayIndex]} · {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {adHoc ? (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {adHoc.name.split(' ')[0]} (Temp)
                      </span>
                    ) : assigned ? (
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {assigned.name.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        Unfilled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 4: Singapore Public Holidays */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Singapore Public Holidays
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              2.0x Pay
            </span>
          </div>

          <div className="space-y-2.5">
            {upcomingHolidays.map((holiday) => (
              <div
                key={holiday.date}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {holiday.localName || holiday.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {holiday.date}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  Premium Pay
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-normal">
            Integrated live via Nager.Date. MOM regulations mandate 2.0x rate or an alternative day off for Singapore gazetted public holidays.
          </p>
        </div>

        {/* Widget 5: Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Recent Operations Activity
            </h3>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 5).map((act) => {
              const icons = {
                shift_created: <Plus className="w-3.5 h-3.5 text-indigo-500" />,
                worker_assigned: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
                absence_reported: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
                hiring_request: <Zap className="w-3.5 h-3.5 text-amber-500" />,
                temp_accepted: <UserCheck className="w-3.5 h-3.5 text-blue-500" />,
                shift_completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
              };

              return (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 mt-0.5 shrink-0">
                    {icons[act.type] || <Activity className="w-3.5 h-3.5 text-slate-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
