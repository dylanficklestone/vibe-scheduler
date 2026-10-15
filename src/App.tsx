import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { RosterScheduler, WEEKS_CONFIG } from './components/RosterScheduler';
import { CalendarView } from './components/CalendarView';
import { StaffDirectory } from './components/StaffDirectory';
import { AdHocLabourPool } from './components/AdHocLabourPool';
import { EmergencyCover } from './components/EmergencyCover';
import { StaffAvailability } from './components/StaffAvailability';
import { TimesheetManager } from './components/TimesheetManager';
import { SalaryCalculator } from './components/SalaryCalculator';
import { AnalyticsInsights } from './components/AnalyticsInsights';
import { CompanyStallSettings } from './components/CompanyStallSettings';
import { CommunityForum } from './components/CommunityForum';
import { ApplicationSettings } from './components/ApplicationSettings';
import { BusinessModelCanvasModal } from './components/BusinessModelCanvasModal';
import { ShiftModal } from './components/ShiftModal';
import { ShiftDetailsPanel } from './components/ShiftDetailsPanel';
import { ToastContainer, ToastMessage } from './components/Toast';
import { getPublicHolidays } from './services/holidayService';
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
  NavTab,
  TaskTemplate,
  ActivityItem,
  UserPreferences,
} from './types';
import {
  initializeAppData,
  saveToStorage,
  STORAGE_KEYS,
  calculateManpowerShortage,
  normalizeShift,
  DEFAULT_TASK_TEMPLATES,
  INITIAL_ACTIVITIES,
  DEFAULT_PREFERENCES,
} from './utils/storage';

export default function App() {
  // Load initial versioned state from localStorage
  const initialData = initializeAppData();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [stores, setStores] = useState<StoreProfile[]>(initialData.stores);
  const [activeStore, setActiveStore] = useState<StoreProfile>(
    initialData.stores.find((s) => s.id === initialData.preferences.selectedStoreId) || initialData.stores[0]
  );

  // Workforce collections
  const [inHouseStaff, setInHouseStaff] = useState<InHouseStaff[]>(initialData.staff);
  const [adHocWorkers, setAdHocWorkers] = useState<AdHocWorker[]>(initialData.adHoc);
  const [shifts, setShifts] = useState<Shift[]>(initialData.shifts);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(initialData.timesheets);
  const [broadcasts, setBroadcasts] = useState<AgencyBroadcastRequest[]>(initialData.broadcasts);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(initialData.forumPosts);
  const [templates, setTemplates] = useState<TaskTemplate[]>(initialData.templates);
  const [activities, setActivities] = useState<ActivityItem[]>(initialData.activities);
  const [preferences, setPreferences] = useState<UserPreferences>(initialData.preferences);

  // Layout UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(preferences.sidebarCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(preferences.theme);

  // Public Holidays
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [holidaySource, setHolidaySource] = useState<string>('Connecting...');
  const [selectedWeekKey, setSelectedWeekKey] = useState<'oct_standard' | 'nov_deepavali' | 'dec_christmas'>('oct_standard');

  // Modals & Drawers
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState(0);

  const [isShiftDetailsOpen, setIsShiftDetailsOpen] = useState(false);
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState<Shift | null>(null);

  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [preSelectedShortageShift, setPreSelectedShortageShift] = useState<Shift | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add activity log
  const logActivity = (
    type: ActivityItem['type'],
    title: string,
    description: string
  ) => {
    const item: ActivityItem = {
      id: `act_${Date.now()}`,
      type,
      title,
      description,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      storeId: activeStore.id,
    };
    setActivities((prev) => [item, ...prev.slice(0, 24)]);
  };

  // Theme synchronization with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setPreferences((prev) => {
      const updated: UserPreferences = { ...prev, theme: nextTheme };
      saveToStorage(STORAGE_KEYS.PREFERENCES, updated);
      return updated;
    });
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      setPreferences((p) => {
        const updated = { ...p, sidebarCollapsed: next };
        saveToStorage(STORAGE_KEYS.PREFERENCES, updated);
        return updated;
      });
      return next;
    });
  };

  // Persist collections to localStorage when state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
  }, [shifts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAFF, inHouseStaff);
  }, [inHouseStaff]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ADHOC, adHocWorkers);
  }, [adHocWorkers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STORES, stores);
  }, [stores]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIMESHEETS, timesheets);
  }, [timesheets]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BROADCASTS, broadcasts);
  }, [broadcasts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FORUM, forumPosts);
  }, [forumPosts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
  }, [templates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVITIES, activities);
  }, [activities]);

  // Fetch Public Holidays on mount
  useEffect(() => {
    async function loadHolidays() {
      try {
        const result = await getPublicHolidays(2026, 'SG');
        setHolidays(result.holidays);
        setHolidaySource(result.source);
      } catch (err) {
        console.error('Failed to load Singapore public holidays:', err);
      }
    }
    loadHolidays();
  }, []);

  // Urgent shortage calculations
  const urgentShifts = shifts.filter(
    (s) => calculateManpowerShortage(s) > 0 || s.status === 'urgent_needed'
  );
  const pendingTimesheetsCount = timesheets.filter((t) => t.status === 'pending_approval').length;

  // Week selection handler
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

  // --- Shift Handlers ---
  const handleOpenAddShift = (dayIndex: number = 0) => {
    setShiftToEdit(null);
    setModalDefaultDay(dayIndex);
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setShiftToEdit(shift);
    setModalDefaultDay(shift.dayIndex);
    setIsShiftModalOpen(true);
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShiftForDetails(shift);
    setIsShiftDetailsOpen(true);
  };

  const handleSaveShift = (
    savedShift: Shift,
    isRecurring: boolean = false,
    recurringType: string = 'none'
  ) => {
    if (!isRecurring || recurringType === 'none') {
      setShifts((prev) => {
        const exists = prev.some((s) => s.id === savedShift.id);
        if (exists) {
          return prev.map((s) => (s.id === savedShift.id ? savedShift : s));
        }
        return [...prev, savedShift];
      });
      addToast('success', 'Shift Saved', `${savedShift.taskName || savedShift.role} scheduled for ${savedShift.dateStr}.`);
      logActivity('shift_created', 'Shift Scheduled', `Scheduled ${savedShift.taskName || savedShift.role} (${savedShift.hours}h).`);
    } else {
      // Create recurring instances across configured days
      const currentWeekDays = WEEKS_CONFIG[selectedWeekKey].days;
      let targetDayIndexes: number[] = [savedShift.dayIndex];

      if (recurringType === 'daily') {
        targetDayIndexes = [0, 1, 2, 3, 4, 5, 6];
      } else if (recurringType === 'weekdays') {
        targetDayIndexes = [0, 1, 2, 3, 4];
      } else if (recurringType === 'weekends') {
        targetDayIndexes = [5, 6];
      }

      const generatedShifts: Shift[] = targetDayIndexes.map((dayIdx) => ({
        ...savedShift,
        id: `shift_${Date.now()}_${dayIdx}_${Math.random().toString(36).slice(2, 6)}`,
        dayIndex: dayIdx,
        dateStr: currentWeekDays[dayIdx]?.dateStr || savedShift.dateStr,
      }));

      setShifts((prev) => {
        const withoutOriginal = prev.filter((s) => s.id !== savedShift.id);
        return [...withoutOriginal, ...generatedShifts];
      });

      addToast(
        'success',
        'Recurring Shifts Created',
        `Replicated ${generatedShifts.length} shifts across ${recurringType} schedule.`
      );
      logActivity(
        'shift_created',
        'Recurring Shifts Created',
        `Generated ${generatedShifts.length} shifts for ${savedShift.taskName || savedShift.role}.`
      );
    }
  };

  const handleDeleteShift = (shiftId: string) => {
    const target = shifts.find((s) => s.id === shiftId);
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    setIsShiftDetailsOpen(false);
    addToast('info', 'Shift Cancelled', `Removed ${target?.taskName || 'shift'} from the weekly roster.`);
  };

  const handleDuplicateShift = (shift: Shift) => {
    const targetDayIndex = (shift.dayIndex + 1) % 7;
    const currentWeekDays = WEEKS_CONFIG[selectedWeekKey].days;
    const duplicated: Shift = {
      ...shift,
      id: `shift_${Date.now()}_dup_${Math.random().toString(36).slice(2, 6)}`,
      dayIndex: targetDayIndex,
      dateStr: currentWeekDays[targetDayIndex]?.dateStr || shift.dateStr,
      taskName: `${shift.taskName || shift.role} (Copy)`,
    };
    setShifts((prev) => [...prev, duplicated]);
    addToast('success', 'Shift Duplicated', `Duplicated to ${currentWeekDays[targetDayIndex]?.name}.`);
    logActivity('shift_created', 'Shift Duplicated', `Duplicated ${duplicated.taskName} to day ${targetDayIndex}.`);
  };

  const handleAssignWorkerToShift = (shiftId: string, workerId: string, isAdHoc: boolean) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const currentAssigned = s.assignedWorkerIds?.length
          ? [...s.assignedWorkerIds]
          : s.assignedStaffId
          ? [s.assignedStaffId]
          : s.assignedAdHocId
          ? [s.assignedAdHocId]
          : [];

        if (!currentAssigned.includes(workerId)) {
          currentAssigned.push(workerId);
        }

        const required = s.requiredHeadcount || 1;
        const status = isAdHoc
          ? 'filled'
          : currentAssigned.length >= required
          ? 'fully_staffed'
          : 'partially_staffed';

        return {
          ...s,
          assignedWorkerIds: currentAssigned,
          assignedStaffId: !isAdHoc ? workerId : s.assignedStaffId,
          assignedAdHocId: isAdHoc ? workerId : s.assignedAdHocId,
          isAdHoc: isAdHoc || s.isAdHoc,
          status,
        };
      })
    );

    const worker = inHouseStaff.find((st) => st.id === workerId) || adHocWorkers.find((a) => a.id === workerId);
    addToast('success', 'Worker Assigned', `Assigned ${worker?.name || 'Worker'} to shift.`);
    logActivity('worker_assigned', 'Staff Assigned', `Assigned ${worker?.name || 'Worker'} to shift.`);
  };

  const handleRemoveWorkerFromShift = (shiftId: string, workerId: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const currentAssigned = (s.assignedWorkerIds || []).filter((id) => id !== workerId);
        const required = s.requiredHeadcount || 1;
        const status =
          currentAssigned.length >= required
            ? 'fully_staffed'
            : currentAssigned.length > 0
            ? 'partially_staffed'
            : 'urgent_needed';

        return {
          ...s,
          assignedWorkerIds: currentAssigned,
          assignedStaffId: s.assignedStaffId === workerId ? undefined : s.assignedStaffId,
          assignedAdHocId: s.assignedAdHocId === workerId ? undefined : s.assignedAdHocId,
          status,
        };
      })
    );
    addToast('info', 'Worker Removed', 'Unassigned worker from shift.');
  };

  const handleReportAbsence = (shiftId: string, workerId?: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const remaining = (s.assignedWorkerIds || []).filter((id) => id !== workerId);
        return {
          ...s,
          assignedWorkerIds: remaining,
          assignedStaffId: s.assignedStaffId === workerId ? undefined : s.assignedStaffId,
          status: 'urgent_needed',
          notes: `Staff reported absence / sick. Urgent cover required.`,
        };
      })
    );

    const staff = inHouseStaff.find((s) => s.id === workerId);
    addToast(
      'warning',
      'Absence Logged',
      `${staff?.name || 'Employee'} marked absent. Shift flagged as urgent shortage.`
    );
    logActivity(
      'absence_reported',
      'Absence Reported',
      `${staff?.name || 'Staff'} reported sick for shift. Urgent cover triggered.`
    );

    // Pre-select for emergency dispatch
    const targetShift = shifts.find((s) => s.id === shiftId);
    if (targetShift) {
      setPreSelectedShortageShift(targetShift);
    }
  };

  const handleFindReplacementForShift = (shift: Shift) => {
    setPreSelectedShortageShift(shift);
    setCurrentTab('emergency');
    addToast('info', 'Emergency Station', `Searching immediate replacement for ${shift.taskName || shift.role}.`);
  };

  // --- Auto-Schedule Engine ---
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
        const candidates = inHouseStaff.filter(
          (staff) =>
            staff.availableDays.includes(dayIndex) &&
            !staff.blackoutDates.includes(dateStr) &&
            staff.skills.includes(template.role) &&
            staffHoursTracker[staff.id] + template.hours <= staff.weeklyTargetHours + 4
        );

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
            storeId: activeStore.id,
            companyName: activeStore.name,
            taskName: `${template.role} (${template.slot})`,
            taskDescription: `Auto-scheduled operational shift balancing ${assigned.name}'s weekly ${assigned.weeklyTargetHours}h target.`,
            dayIndex,
            dateStr,
            startTime: template.start,
            endTime: template.end,
            hours: template.hours,
            role: template.role,
            slotType: template.slot,
            requiredHeadcount: 1,
            assignedWorkerIds: [assigned.id],
            assignedStaffId: assigned.id,
            isAdHoc: false,
            status: 'fully_staffed',
            hourlyRate: assigned.hourlyRate,
            notes: isHoliday ? 'Public Holiday Shift (Double Pay eligible)' : 'Auto-balanced shift',
            unpaidBreakMinutes: 30,
          });
        } else {
          newShifts.push({
            id: `auto_shift_${dayIndex}_${templateIdx}_shortage_${Date.now()}`,
            storeId: activeStore.id,
            companyName: activeStore.name,
            taskName: `${template.role} Rush (${template.slot})`,
            taskDescription: 'Staff availability gap detected. Ready for casual on-demand hire.',
            dayIndex,
            dateStr,
            startTime: template.start,
            endTime: template.end,
            hours: template.hours,
            role: template.role,
            slotType: template.slot,
            requiredHeadcount: 1,
            assignedWorkerIds: [],
            isAdHoc: false,
            status: 'urgent_needed',
            hourlyRate: template.rate,
            notes: isHoliday
              ? 'Public Holiday shortage! Tap ready casual pool.'
              : 'In-house staff rest day gap! Tap ready casual pool.',
            unpaidBreakMinutes: 30,
          });
        }
      });
    }

    setShifts(newShifts);
    addToast('success', 'Roster Auto-Scheduled', `Generated ${newShifts.length} optimized shifts across in-house staff.`);
    logActivity('worker_assigned', 'Auto-Roster Solved', `Engine scheduled ${newShifts.length} shifts respecting availability rules.`);
  };

  // --- Ad-Hoc / Temp Worker Deployment ---
  const handleDeployAdHocWorker = (shiftId: string, workerId: string) => {
    const worker = adHocWorkers.find((w) => w.id === workerId);
    if (!worker) return;

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const currentAssigned = s.assignedWorkerIds ? [...s.assignedWorkerIds, worker.id] : [worker.id];
        return {
          ...s,
          assignedWorkerIds: currentAssigned,
          assignedAdHocId: worker.id,
          isAdHoc: true,
          status: 'filled',
          hourlyRate: worker.hourlyRate,
          notes: `Contract casual deployed via ${worker.verifiedAgency} (+$4.50 fee)`,
        };
      })
    );

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
        discrepancyNote: `Fast dispatch completed via ${worker.verifiedAgency}.`,
      };
      setTimesheets((prev) => [newTs, ...prev]);
    }

    addToast('success', 'Casual Worker Deployed', `${worker.name} assigned to shift (+$4.50 placement fee).`);
    logActivity('temp_accepted', 'Casual Worker Deployed', `${worker.name} booked for ${targetShift?.taskName || 'shift'}.`);
  };

  // --- Import / Export / Reset Handlers ---
  const handleImportData = (dataset: any) => {
    if (dataset.stores) setStores(dataset.stores);
    if (dataset.staff) setInHouseStaff(dataset.staff);
    if (dataset.adHoc) setAdHocWorkers(dataset.adHoc);
    if (dataset.shifts) setShifts(dataset.shifts);
    if (dataset.timesheets) setTimesheets(dataset.timesheets);
    if (dataset.broadcasts) setBroadcasts(dataset.broadcasts);
    if (dataset.forumPosts) setForumPosts(dataset.forumPosts);
    if (dataset.templates) setTemplates(dataset.templates);
    if (dataset.activities) setActivities(dataset.activities);
    if (dataset.preferences) setPreferences(dataset.preferences);

    addToast('success', 'Backup Restored', 'All data successfully loaded from JSON backup.');
  };

  const handleResetFactoryData = () => {
    localStorage.clear();
    const fresh = initializeAppData();
    setStores(fresh.stores);
    setActiveStore(fresh.stores[0]);
    setInHouseStaff(fresh.staff);
    setAdHocWorkers(fresh.adHoc);
    setShifts(fresh.shifts);
    setTimesheets(fresh.timesheets);
    setBroadcasts(fresh.broadcasts);
    setForumPosts(fresh.forumPosts);
    setTemplates(fresh.templates);
    setActivities(fresh.activities);
    setPreferences(fresh.preferences);

    addToast('info', 'Factory Data Restored', 'Reset to initial sample stall and rosters.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden transition-colors">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        urgentShiftsCount={urgentShifts.length}
        pendingTimesheetsCount={pendingTimesheetsCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeStore={activeStore}
        stores={stores}
        onSelectStore={setActiveStore}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          activeStore={activeStore}
          stores={stores}
          onSelectStore={setActiveStore}
          urgentShifts={urgentShifts}
          onOpenUrgentModal={() => {
            if (urgentShifts.length > 0) {
              handleFindReplacementForShift(urgentShifts[0]);
            } else {
              setCurrentTab('emergency');
            }
          }}
          onOpenCanvasModal={() => setIsCanvasModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onNavigateTab={setCurrentTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* View Router */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Overview: Dashboard */}
          {currentTab === 'dashboard' && (
            <Dashboard
              shifts={shifts}
              inHouseStaff={inHouseStaff}
              adHocWorkers={adHocWorkers}
              activeStore={activeStore}
              holidays={holidays}
              activities={activities}
              onNavigateTab={setCurrentTab}
              onOpenAddShift={() => handleOpenAddShift(0)}
              onFindReplacementForShift={handleFindReplacementForShift}
              onAutoGenerateRoster={handleAutoGenerateRoster}
            />
          )}

          {/* Overview: Weekly Roster */}
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
              onShiftClick={handleShiftClick}
              onAutoGenerateRoster={handleAutoGenerateRoster}
              onOpenAdHocModal={(s) => {
                if (s) handleFindReplacementForShift(s);
                else setCurrentTab('adhoc');
              }}
              onResetRoster={handleResetFactoryData}
            />
          )}

          {/* Overview: Calendar */}
          {currentTab === 'calendar' && (
            <CalendarView
              shifts={shifts}
              holidays={holidays}
              onOpenAddShift={handleOpenAddShift}
              onShiftClick={handleShiftClick}
            />
          )}

          {/* Workforce: Staff Directory */}
          {currentTab === 'staff' && (
            <StaffDirectory
              staffList={inHouseStaff}
              shifts={shifts}
              onAddStaff={(newStaff) => {
                setInHouseStaff((prev) => [...prev, newStaff]);
                addToast('success', 'Staff Added', `Added ${newStaff.name} to employee directory.`);
              }}
              onUpdateStaff={(updatedStaff) => {
                setInHouseStaff((prev) =>
                  prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
                );
                addToast('success', 'Staff Updated', `Updated profile for ${updatedStaff.name}.`);
              }}
              onDeleteStaff={(staffId) => {
                const staff = inHouseStaff.find((s) => s.id === staffId);
                setInHouseStaff((prev) => prev.filter((s) => s.id !== staffId));
                setShifts((prev) =>
                  prev.map((shift) =>
                    shift.assignedStaffId === staffId
                      ? { ...shift, assignedStaffId: undefined, status: 'urgent_needed' }
                      : shift
                  )
                );
                addToast('info', 'Staff Removed', `Removed ${staff?.name || 'Staff'}.`);
              }}
            />
          )}

          {/* Workforce: Temporary Staff Pool */}
          {currentTab === 'adhoc' && (
            <AdHocLabourPool
              adHocWorkers={adHocWorkers}
              urgentShifts={urgentShifts}
              broadcasts={broadcasts}
              onBookWorkerForShift={(worker, shiftId) => {
                handleDeployAdHocWorker(shiftId, worker.id);
              }}
              onCreateBroadcast={(newB) => {
                setBroadcasts((prev) => [newB, ...prev]);
                addToast('success', 'Broadcast Created', `Syndicated ${newB.role} cover request.`);
              }}
              preSelectedShift={preSelectedShortageShift}
            />
          )}

          {/* Workforce: Emergency Cover */}
          {currentTab === 'emergency' && (
            <EmergencyCover
              shifts={shifts}
              broadcasts={broadcasts}
              adHocWorkers={adHocWorkers}
              activeStore={activeStore}
              onBroadcastCover={(newB) => {
                setBroadcasts((prev) => [newB, ...prev]);
                addToast('success', 'Cover Broadcasted', `Syndicated to QuickCrew, FastJobs, and GrabJobs.`);
              }}
              onDeployAdHocWorker={handleDeployAdHocWorker}
              onShiftClick={handleShiftClick}
            />
          )}

          {/* Workforce: Staff Availability */}
          {currentTab === 'availability' && (
            <StaffAvailability
              inHouseStaff={inHouseStaff}
              onUpdateStaffAvailability={(updatedList) => {
                setInHouseStaff(updatedList);
                addToast('success', 'Availability Updated', 'Saved working day constraints and blackout dates.');
              }}
            />
          )}

          {/* Operations: Timesheets */}
          {currentTab === 'timesheets' && (
            <TimesheetManager
              timesheets={timesheets}
              onApproveTimesheet={(id) => {
                setTimesheets((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
                );
                addToast('success', 'Timesheet Approved', 'Marked timesheet approved for payroll.');
              }}
              onApproveAll={() => {
                setTimesheets((prev) =>
                  prev.map((t) => (t.status === 'pending_approval' ? { ...t, status: 'approved' } : t))
                );
                addToast('success', 'All Timesheets Approved', 'Approved all pending clock-ins.');
              }}
              onAddTimesheet={(entry) => {
                setTimesheets((prev) => [entry, ...prev]);
                addToast('success', 'Timesheet Created', `Added timesheet for ${entry.staffName}.`);
              }}
              onUpdateTimesheet={(entry) => {
                setTimesheets((prev) =>
                  prev.map((t) => (t.id === entry.id ? entry : t))
                );
                addToast('success', 'Timesheet Updated', `Updated timesheet for ${entry.staffName}.`);
              }}
            />
          )}

          {/* Operations: Salary & Payroll */}
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

          {/* Operations: Reports & Insights */}
          {currentTab === 'reports' && (
            <AnalyticsInsights
              shifts={shifts}
              inHouseStaff={inHouseStaff}
              adHocWorkers={adHocWorkers}
              activeStore={activeStore}
            />
          )}

          {/* Management: Company & Stall Settings */}
          {currentTab === 'stores' && (
            <CompanyStallSettings
              stores={stores}
              activeStore={activeStore}
              onSelectStore={setActiveStore}
              onAddStore={(newStore) => {
                setStores((prev) => [...prev, newStore]);
                addToast('success', 'Outlet Added', `Added ${newStore.name} to store registry.`);
              }}
              onUpdateStore={(updatedStore) => {
                setStores((prev) =>
                  prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
                );
                if (activeStore.id === updatedStore.id) setActiveStore(updatedStore);
                addToast('success', 'Outlet Settings Saved', `Updated configuration for ${updatedStore.name}.`);
              }}
            />
          )}

          {/* Management: Community */}
          {currentTab === 'community' && (
            <CommunityForum
              posts={forumPosts}
              onAddPost={(post) => {
                setForumPosts((prev) => [post, ...prev]);
                addToast('success', 'Discussion Published', 'Your peer question has been posted.');
              }}
              onUpvotePost={(id) => {
                setForumPosts((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
                );
              }}
            />
          )}

          {/* Management: Application Settings */}
          {currentTab === 'settings' && (
            <ApplicationSettings
              preferences={preferences}
              onUpdatePreferences={(p) => {
                setPreferences(p);
                saveToStorage(STORAGE_KEYS.PREFERENCES, p);
                addToast('success', 'Settings Saved', 'Updated default statutory payroll parameters.');
              }}
              appState={{
                stores,
                staff: inHouseStaff,
                adHoc: adHocWorkers,
                shifts,
                timesheets,
                broadcasts,
                forumPosts,
                templates,
                activities,
                preferences,
              }}
              onImportData={handleImportData}
              onResetFactoryData={handleResetFactoryData}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Weekly Roster & Shift Operations
              </span>
              <span>·</span>
              <span>Single-Outlet & Stall Manpower Management</span>
              <span>·</span>
              <span className="font-mono text-slate-400">Nager.Date 2026 Live API</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <button
                onClick={() => setIsCanvasModalOpen(true)}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Strategyzer Model Canvas
              </button>
              <span>·</span>
              <span>localStorage Demonstration v3.0</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Shift Creation & Edit Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftToEdit={shiftToEdit}
        defaultDayIndex={modalDefaultDay}
        inHouseStaff={inHouseStaff}
        adHocWorkers={adHocWorkers}
        activeStore={activeStore}
        stores={stores}
        templates={templates}
        onSaveShift={handleSaveShift}
        onDeleteShift={handleDeleteShift}
        onSaveTemplate={(tmpl) => {
          setTemplates((prev) => [...prev, tmpl]);
          addToast('success', 'Template Saved', `Saved "${tmpl.taskName}" for future fast scheduling.`);
        }}
        activeWeekDays={WEEKS_CONFIG[selectedWeekKey].days}
      />

      {/* Shift Details Slide-Out Panel */}
      <ShiftDetailsPanel
        isOpen={isShiftDetailsOpen}
        onClose={() => {
          setIsShiftDetailsOpen(false);
          setSelectedShiftForDetails(null);
        }}
        shift={selectedShiftForDetails}
        inHouseStaff={inHouseStaff}
        adHocWorkers={adHocWorkers}
        holidays={holidays}
        onEditShift={handleOpenEditShift}
        onAssignWorker={handleAssignWorkerToShift}
        onRemoveWorker={handleRemoveWorkerFromShift}
        onReportAbsence={handleReportAbsence}
        onFindReplacement={handleFindReplacementForShift}
        onDuplicateShift={handleDuplicateShift}
        onCancelShift={handleDeleteShift}
      />

      {/* Business Model Canvas Modal */}
      <BusinessModelCanvasModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
        onNavigateToFeature={(tab) => {
          setIsCanvasModalOpen(false);
          setCurrentTab(tab);
        }}
      />
    </div>
  );
}
