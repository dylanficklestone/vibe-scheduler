import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { RosterScheduler, WEEKS_CONFIG } from './components/RosterScheduler';
import { AdHocLabourPool } from './components/AdHocLabourPool';
import { StaffDirectory } from './components/StaffDirectory';
import { TimesheetManager } from './components/TimesheetManager';
import { SalaryCalculator } from './components/SalaryCalculator';
import { AnalyticsInsights } from './components/AnalyticsInsights';
import { CommunityForum } from './components/CommunityForum';
import { BusinessModelCanvasModal } from './components/BusinessModelCanvasModal';
import { ShiftModal } from './components/ShiftModal';
import { getPublicHolidays } from './services/holidayService';
import {
  INITIAL_STORES,
  INITIAL_IN_HOUSE_STAFF,
  INITIAL_AD_HOC_WORKERS,
  INITIAL_SHIFTS,
  INITIAL_TIMESHEETS,
  INITIAL_BROADCASTS,
  INITIAL_FORUM_POSTS,
} from './data/mockData';
import {
  Shift,
  InHouseStaff,
  AdHocWorker,
  TimesheetEntry,
  StoreProfile,
  AgencyBroadcastRequest,
  ForumPost,
  ShiftRole,
  PublicHoliday,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('roster');
  const [stores, setStores] = useState<StoreProfile[]>(INITIAL_STORES);
  const [activeStore, setActiveStore] = useState<StoreProfile>(INITIAL_STORES[0]);

  // Public Holidays live from Nager.Date (/api/holiday)
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [holidaySource, setHolidaySource] = useState<string>('Connecting...');
  const [selectedWeekKey, setSelectedWeekKey] = useState<'oct_standard' | 'nov_deepavali' | 'dec_christmas'>('oct_standard');

  // Data collections
  const [inHouseStaff, setInHouseStaff] = useState<InHouseStaff[]>(INITIAL_IN_HOUSE_STAFF);
  const [adHocWorkers, setAdHocWorkers] = useState<AdHocWorker[]>(INITIAL_AD_HOC_WORKERS);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(INITIAL_TIMESHEETS);
  const [broadcasts, setBroadcasts] = useState<AgencyBroadcastRequest[]>(INITIAL_BROADCASTS);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);

  // Modals
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState(0);

  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [preSelectedShortageShift, setPreSelectedShortageShift] = useState<Shift | null>(null);

  // Fetch Public Holidays on mount from serverless connection /api/holiday
  useEffect(() => {
    async function loadHolidays() {
      try {
        const result = await getPublicHolidays(2026, 'SG');
        setHolidays(result.holidays);
        setHolidaySource(result.source);
      } catch (err) {
        console.error('Failed to load public holidays:', err);
      }
    }
    loadHolidays();
  }, []);

  // Urgent shifts calculation
  const urgentShifts = shifts.filter((s) => s.status === 'urgent_needed');

  // Week selection handler that syncs shift date strings
  const handleSelectWeek = (weekKey: 'oct_standard' | 'nov_deepavali' | 'dec_christmas') => {
    setSelectedWeekKey(weekKey);
    const targetDays = WEEKS_CONFIG[weekKey].days;
    setShifts((prev) =>
      prev.map((s) => ({
        ...s,
        dateStr: targetDays[s.dayIndex]?.dateStr || s.dateStr,
      }))
    );
  };

  // --- Handlers: Shift Management & Auto-Roster ---
  const handleOpenAddShift = (dayIndex: number) => {
    setShiftToEdit(null);
    setModalDefaultDay(dayIndex);
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setShiftToEdit(shift);
    setModalDefaultDay(shift.dayIndex);
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (savedShift: Shift) => {
    setShifts((prev) => {
      const exists = prev.some((s) => s.id === savedShift.id);
      if (exists) {
        return prev.map((s) => (s.id === savedShift.id ? savedShift : s));
      }
      return [...prev, savedShift];
    });
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  // 1-Click Auto-Schedule Engine (Accounts for in-house availability & public holidays)
  const handleAutoGenerateRoster = () => {
    const newShifts: Shift[] = [];
    const staffHoursTracker: Record<string, number> = {};
    inHouseStaff.forEach((s) => (staffHoursTracker[s.id] = 0));

    const currentWeekDays = WEEKS_CONFIG[selectedWeekKey].days;

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayConfig = currentWeekDays[dayIndex];
      const dateStr = dayConfig.dateStr;
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const isHoliday = holidays.some((h) => h.date === dateStr);

      const dailyTemplates: {
        role: ShiftRole;
        slot: 'Morning' | 'Mid-Day' | 'Evening';
        start: string;
        end: string;
        hours: number;
        rate: number;
      }[] = [
        { role: 'Floor Lead', slot: 'Morning', start: '07:30', end: '15:30', hours: 8, rate: 22 },
        { role: 'Barista', slot: 'Morning', start: '08:00', end: '15:00', hours: 7, rate: 17 },
        { role: 'Kitchen / Cook', slot: 'Morning', start: '08:30', end: '16:30', hours: 8, rate: 20 },
        { role: 'Cashier', slot: 'Evening', start: '13:30', end: '21:30', hours: 8, rate: 16 },
      ];

      // On weekends or public holidays, add extra retail & barista rush cover
      if (isWeekend || isHoliday) {
        dailyTemplates.push({
          role: 'Retail Associate',
          slot: 'Evening',
          start: '14:00',
          end: '21:30',
          hours: 7.5,
          rate: 15.5,
        });
      }

      dailyTemplates.forEach((template, templateIdx) => {
        // Find best eligible staff: available on this day, has skill, hasn't exceeded weekly target hours
        const candidates = inHouseStaff.filter(
          (staff) =>
            staff.availableDays.includes(dayIndex) &&
            staff.skills.includes(template.role) &&
            staffHoursTracker[staff.id] + template.hours <= staff.weeklyTargetHours + 4
        );

        // Sort candidate with fewest hours so far
        candidates.sort(
          (a, b) =>
            staffHoursTracker[a.id] / a.weeklyTargetHours -
            staffHoursTracker[b.id] / b.weeklyTargetHours
        );

        const assigned = candidates[0];

        if (assigned) {
          staffHoursTracker[assigned.id] += template.hours;
          newShifts.push({
            id: `auto_shift_${dayIndex}_${templateIdx}_${Date.now()}`,
            dayIndex,
            dateStr,
            startTime: template.start,
            endTime: template.end,
            hours: template.hours,
            role: template.role,
            slotType: template.slot,
            assignedStaffId: assigned.id,
            isAdHoc: false,
            status: 'filled',
            hourlyRate: assigned.hourlyRate,
            notes: isHoliday
              ? 'Public Holiday Shift (Premium Pay active)'
              : `Auto-balanced (Target: ${assigned.weeklyTargetHours}h)`,
          });
        } else {
          // Flagged as urgent shortage
          newShifts.push({
            id: `auto_shift_${dayIndex}_${templateIdx}_shortage`,
            dayIndex,
            dateStr,
            startTime: template.start,
            endTime: template.end,
            hours: template.hours,
            role: template.role,
            slotType: template.slot,
            isAdHoc: false,
            status: 'urgent_needed',
            hourlyRate: template.rate,
            notes: isHoliday
              ? 'Public Holiday shortage! Tap ready casual pool.'
              : 'In-house staff rest day conflict! Tap ready casual pool.',
          });
        }
      });
    }

    setShifts(newShifts);
  };

  // --- Handlers: Ad-Hoc Casual Labor Hire ---
  const handleBookWorkerForShift = (worker: AdHocWorker, shiftId: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          return {
            ...s,
            assignedStaffId: undefined,
            assignedAdHocId: worker.id,
            isAdHoc: true,
            status: 'filled',
            hourlyRate: worker.hourlyRate,
            notes: `Contract Casual via ${worker.verifiedAgency} (+$4.50 fee)`,
          };
        }
        return s;
      })
    );

    // Also add an automated timesheet entry
    const targetShift = shifts.find((s) => s.id === shiftId);
    if (targetShift) {
      const newTs: TimesheetEntry = {
        id: `ts_${Date.now()}`,
        staffName: `${worker.name} (Ad-Hoc)`,
        isAdHoc: true,
        role: targetShift.role,
        date: targetShift.dateStr,
        scheduledStart: targetShift.startTime,
        scheduledEnd: targetShift.endTime,
        actualClockIn: targetShift.startTime,
        actualClockOut: targetShift.endTime,
        breakMinutes: 30,
        totalHours: targetShift.hours,
        overtimeHours: 0,
        hourlyRate: worker.hourlyRate,
        status: 'pending_approval',
        discrepancyNote: 'On-demand shift completed via QuickCrew verification.',
      };
      setTimesheets((prev) => [newTs, ...prev]);
    }
  };

  const handleOpenAdHocFromRoster = (shift?: Shift) => {
    if (shift) {
      setPreSelectedShortageShift(shift);
    } else {
      setPreSelectedShortageShift(urgentShifts.length > 0 ? urgentShifts[0] : null);
    }
    setCurrentTab('adhoc');
  };

  const handleCreateBroadcast = (newBroadcast: AgencyBroadcastRequest) => {
    setBroadcasts((prev) => [newBroadcast, ...prev]);
  };

  // --- Handlers: In-House Staff Directory ---
  const handleAddStaff = (newStaff: InHouseStaff) => {
    setInHouseStaff((prev) => [...prev, newStaff]);
  };

  const handleUpdateStaff = (updatedStaff: InHouseStaff) => {
    setInHouseStaff((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
  };

  const handleDeleteStaff = (staffId: string) => {
    setInHouseStaff((prev) => prev.filter((s) => s.id !== staffId));
    setShifts((prev) =>
      prev.map((shift) =>
        shift.assignedStaffId === staffId
          ? { ...shift, assignedStaffId: undefined, status: 'urgent_needed' }
          : shift
      )
    );
  };

  // --- Handlers: Timesheet Management ---
  const handleApproveTimesheet = (id: string) => {
    setTimesheets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    );
  };

  const handleApproveAllTimesheets = () => {
    setTimesheets((prev) =>
      prev.map((t) => (t.status === 'pending_approval' ? { ...t, status: 'approved' } : t))
    );
  };

  const handleAddTimesheet = (entry: TimesheetEntry) => {
    setTimesheets((prev) => [entry, ...prev]);
  };

  const handleUpdateTimesheet = (entry: TimesheetEntry) => {
    setTimesheets((prev) =>
      prev.map((t) => (t.id === entry.id ? entry : t))
    );
  };

  // --- Handlers: Community Forum ---
  const handleAddForumPost = (post: ForumPost) => {
    setForumPosts((prev) => [post, ...prev]);
  };

  const handleUpvoteForumPost = (id: string) => {
    setForumPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handleResetToDemo = () => {
    setShifts(INITIAL_SHIFTS);
    setInHouseStaff(INITIAL_IN_HOUSE_STAFF);
    setTimesheets(INITIAL_TIMESHEETS);
    setBroadcasts(INITIAL_BROADCASTS);
    setForumPosts(INITIAL_FORUM_POSTS);
    setSelectedWeekKey('oct_standard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar with Three-Zone Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeStore={activeStore}
        stores={stores}
        onSelectStore={setActiveStore}
        onOpenUrgentModal={() => handleOpenAdHocFromRoster()}
        onOpenCanvasModal={() => setIsCanvasModalOpen(true)}
        urgentShiftsCount={urgentShifts.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'roster' && (
          <RosterScheduler
            shifts={shifts}
            inHouseStaff={inHouseStaff}
            adHocWorkers={adHocWorkers}
            activeStore={activeStore}
            holidays={holidays}
            holidaySource={holidaySource}
            selectedWeekKey={selectedWeekKey}
            onSelectWeek={handleSelectWeek}
            onAddShift={handleOpenAddShift}
            onEditShift={handleOpenEditShift}
            onAutoGenerateRoster={handleAutoGenerateRoster}
            onOpenAdHocModal={handleOpenAdHocFromRoster}
            onResetRoster={handleResetToDemo}
          />
        )}

        {currentTab === 'adhoc' && (
          <AdHocLabourPool
            adHocWorkers={adHocWorkers}
            urgentShifts={urgentShifts}
            broadcasts={broadcasts}
            onBookWorkerForShift={handleBookWorkerForShift}
            onCreateBroadcast={handleCreateBroadcast}
            preSelectedShift={preSelectedShortageShift}
          />
        )}

        {currentTab === 'staff' && (
          <StaffDirectory
            staffList={inHouseStaff}
            shifts={shifts}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        )}

        {currentTab === 'timesheets' && (
          <TimesheetManager
            timesheets={timesheets}
            onApproveTimesheet={handleApproveTimesheet}
            onApproveAll={handleApproveAllTimesheets}
            onAddTimesheet={handleAddTimesheet}
            onUpdateTimesheet={handleUpdateTimesheet}
          />
        )}

        {currentTab === 'salary' && (
          <SalaryCalculator
            inHouseStaff={inHouseStaff}
            adHocWorkers={adHocWorkers}
            shifts={shifts}
            timesheets={timesheets}
            activeStore={activeStore}
            holidays={holidays}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsInsights
            shifts={shifts}
            inHouseStaff={inHouseStaff}
            adHocWorkers={adHocWorkers}
            activeStore={activeStore}
          />
        )}

        {currentTab === 'community' && (
          <CommunityForum
            posts={forumPosts}
            onAddPost={handleAddForumPost}
            onUpvotePost={handleUpvoteForumPost}
          />
        )}
      </main>

      {/* Shift Edit / Add Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftToEdit={shiftToEdit}
        defaultDayIndex={modalDefaultDay}
        inHouseStaff={inHouseStaff}
        adHocWorkers={adHocWorkers}
        onSaveShift={handleSaveShift}
        onDeleteShift={handleDeleteShift}
        onOpenAdHocBooking={(shift) => handleOpenAdHocFromRoster(shift)}
        holidays={holidays}
        activeWeekDays={WEEKS_CONFIG[selectedWeekKey].days}
      />

      {/* Business Model Canvas Viewer Modal */}
      <BusinessModelCanvasModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
        onNavigateToFeature={(tab) => {
          setCurrentTab(tab);
        }}
      />

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ShiftPulse</span>
            <span>·</span>
            <span>1-Store Retail & F&B Manpower Scheduler</span>
            <span>·</span>
            <span className="font-mono text-slate-400">
              Nager.Date 2026 Live API
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCanvasModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Strategyzer Business Model Canvas Spec
            </button>
            <span>·</span>
            <span>© 2026 ShiftPulse Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
