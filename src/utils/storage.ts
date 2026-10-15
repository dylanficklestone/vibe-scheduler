import {
  StoreProfile,
  InHouseStaff,
  AdHocWorker,
  Shift,
  TimesheetEntry,
  AgencyBroadcastRequest,
  ForumPost,
  TaskTemplate,
  ActivityItem,
  UserPreferences,
} from '../types';
import {
  INITIAL_STORES,
  INITIAL_IN_HOUSE_STAFF,
  INITIAL_AD_HOC_WORKERS,
  INITIAL_SHIFTS,
  INITIAL_TIMESHEETS,
  INITIAL_BROADCASTS,
  INITIAL_FORUM_POSTS,
} from '../data/mockData';

// Versioned localStorage keys
export const STORAGE_VERSION = 'v3.0.0';
export const STORAGE_KEYS = {
  VERSION: 'WRSO_STORAGE_VERSION',
  STORES: 'WRSO_V3_STORES',
  STAFF: 'WRSO_V3_STAFF',
  ADHOC: 'WRSO_V3_ADHOC',
  SHIFTS: 'WRSO_V3_SHIFTS',
  TIMESHEETS: 'WRSO_V3_TIMESHEETS',
  BROADCASTS: 'WRSO_V3_BROADCASTS',
  FORUM: 'WRSO_V3_FORUM',
  TEMPLATES: 'WRSO_V3_TEMPLATES',
  ACTIVITIES: 'WRSO_V3_ACTIVITIES',
  PREFERENCES: 'WRSO_V3_PREFERENCES',
} as const;

export const DEFAULT_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tmpl_1',
    taskName: 'Morning Espresso Bar & Opening',
    taskDescription: 'Espresso machine calibration, grind dial-in, opening inventory check, and breakfast rush bar.',
    role: 'Barista',
    startTime: '07:30',
    endTime: '15:30',
    hours: 8,
    requiredHeadcount: 1,
    hourlyRate: 18,
    requiredSkills: ['Barista', 'Cashier'],
    slotType: 'Morning',
    unpaidBreakMinutes: 30,
  },
  {
    id: 'tmpl_2',
    taskName: 'Fresh Pastry Bake & Lunch Prep',
    taskDescription: 'Fresh croissant bake, artisanal sandwich assembly, temperature logs, and HACCP compliance.',
    role: 'Kitchen / Cook',
    startTime: '08:00',
    endTime: '16:00',
    hours: 8,
    requiredHeadcount: 1,
    hourlyRate: 20,
    requiredSkills: ['Kitchen / Cook', 'Inventory / Stock'],
    slotType: 'Morning',
    unpaidBreakMinutes: 45,
  },
  {
    id: 'tmpl_3',
    taskName: 'Evening Counter Service & Register Close',
    taskDescription: 'Customer order taking, POS reconciliation, afternoon beverage prep, and cash drawer handoff.',
    role: 'Cashier',
    startTime: '13:30',
    endTime: '21:30',
    hours: 8,
    requiredHeadcount: 1,
    hourlyRate: 16,
    requiredSkills: ['Cashier', 'Retail Associate'],
    slotType: 'Evening',
    unpaidBreakMinutes: 30,
  },
  {
    id: 'tmpl_4',
    taskName: 'Shift Supervisor & Store Lockup',
    taskDescription: 'Supervise floor operations, customer disputes, end-of-day sales report, and closing lockup.',
    role: 'Floor Lead',
    startTime: '14:00',
    endTime: '22:00',
    hours: 8,
    requiredHeadcount: 1,
    hourlyRate: 22,
    requiredSkills: ['Floor Lead', 'Cashier', 'Barista'],
    slotType: 'Evening',
    unpaidBreakMinutes: 30,
  },
  {
    id: 'tmpl_5',
    taskName: 'Weekend Retail Merchandise Rush',
    taskDescription: 'High-traffic retail floor assist, customer sizing recommendations, and shelf replenishment.',
    role: 'Retail Associate',
    startTime: '12:00',
    endTime: '20:00',
    hours: 8,
    requiredHeadcount: 1,
    hourlyRate: 16.5,
    requiredSkills: ['Retail Associate', 'Cashier'],
    slotType: 'Mid-Day',
    unpaidBreakMinutes: 30,
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'absence_reported',
    title: 'Staff Absence Reported',
    description: 'Marcus Chen reported sick for Tue Evening Barista shift. Urgent cover triggered.',
    timestamp: '15 mins ago',
    timestampMs: Date.now() - 15 * 60 * 1000,
    storeId: 'store_1',
  },
  {
    id: 'act_2',
    type: 'temp_accepted',
    title: 'Temporary Worker Confirmed',
    description: 'Derrick Koh confirmed for Fri Evening Barista rush slot (via QuickCrew).',
    timestamp: '1 hour ago',
    timestampMs: Date.now() - 60 * 60 * 1000,
    storeId: 'store_1',
  },
  {
    id: 'act_3',
    type: 'worker_assigned',
    title: 'Roster Auto-Scheduled',
    description: 'Generated shifts across in-house staff balancing weekly target hours.',
    timestamp: '4 hours ago',
    timestampMs: Date.now() - 4 * 3600 * 1000,
    storeId: 'store_1',
  },
  {
    id: 'act_4',
    type: 'shift_created',
    title: 'Weekend Surge Shift Added',
    description: 'Added Saturday evening cashier rush coverage for Roast & Bloom.',
    timestamp: 'Yesterday',
    timestampMs: Date.now() - 24 * 3600 * 1000,
    storeId: 'store_1',
  },
  {
    id: 'act_5',
    type: 'hiring_request',
    title: 'Agency Cover Broadcasted',
    description: 'Broadcasted urgent Barista request to QuickCrew, FastJobs, and GrabJobs.',
    timestamp: 'Yesterday',
    timestampMs: Date.now() - 26 * 3600 * 1000,
    storeId: 'store_1',
  },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  sidebarCollapsed: false,
  selectedStoreId: 'store_1',
  otThreshold: 44,
  employerCpfRate: 17,
  weekendAllowance: 2.0,
  phMultiplier: 2.0,
};

// Safe localStorage JSON load with fallback
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[localStorage] Failed to load key "${key}", using fallback:`, err);
    return fallback;
  }
}

// Safe localStorage save
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[localStorage] Failed to write key "${key}":`, err);
  }
}

// Ensure shift data is normalized with multi-headcount fields
export function normalizeShift(raw: any, defaultStoreId: string = 'store_1'): Shift {
  const assignedWorkerIds: string[] = Array.isArray(raw.assignedWorkerIds)
    ? [...raw.assignedWorkerIds]
    : raw.assignedStaffId
    ? [raw.assignedStaffId]
    : raw.assignedAdHocId
    ? [raw.assignedAdHocId]
    : [];

  const isAdHoc = Boolean(
    raw.isAdHoc ||
    raw.assignedAdHocId ||
    assignedWorkerIds.some((id) => id.startsWith('adhoc_'))
  );

  const requiredHeadcount = Math.max(Number(raw.requiredHeadcount) || 1, 1);

  // Derive status
  let status = raw.status;
  if (!status || status === 'unassigned') {
    status = assignedWorkerIds.length === 0 ? 'unfilled' : 'fully_staffed';
  } else if (status === 'filled') {
    status = assignedWorkerIds.length >= requiredHeadcount ? 'fully_staffed' : 'partially_staffed';
  }

  return {
    id: raw.id || `shift_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    storeId: raw.storeId || defaultStoreId,
    companyName: raw.companyName || 'Roast & Bloom',
    taskName: raw.taskName || `${raw.role} Shift`,
    taskDescription: raw.taskDescription || raw.notes || '',
    dayIndex: typeof raw.dayIndex === 'number' ? raw.dayIndex : 0,
    dateStr: raw.dateStr || '2026-10-19',
    startTime: raw.startTime || '08:00',
    endTime: raw.endTime || '16:00',
    hours: typeof raw.hours === 'number' ? raw.hours : 8,
    role: raw.role || 'Barista',
    slotType: raw.slotType || 'Morning',
    requiredHeadcount,
    assignedWorkerIds,
    assignedStaffId: raw.assignedStaffId || assignedWorkerIds.find((id) => id.startsWith('staff_')),
    assignedAdHocId: raw.assignedAdHocId || assignedWorkerIds.find((id) => id.startsWith('adhoc_')),
    isAdHoc,
    status,
    notes: raw.notes || '',
    hourlyRate: typeof raw.hourlyRate === 'number' ? raw.hourlyRate : 18,
    requiredSkills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills : [raw.role || 'Barista'],
    unpaidBreakMinutes: typeof raw.unpaidBreakMinutes === 'number' ? raw.unpaidBreakMinutes : 30,
    recurringSchedule: raw.recurringSchedule || 'none',
    templateId: raw.templateId,
  };
}

// Calculate manpower shortage helper: MAX(Required Headcount - Confirmed Assigned Workers, 0)
export function calculateManpowerShortage(shift: Shift): number {
  const confirmedCount = getConfirmedAssignedCount(shift);
  return Math.max((shift.requiredHeadcount || 1) - confirmedCount, 0);
}

export function getConfirmedAssignedCount(shift: Shift): number {
  if (Array.isArray(shift.assignedWorkerIds) && shift.assignedWorkerIds.length > 0) {
    return shift.assignedWorkerIds.length;
  }
  if (shift.assignedStaffId || shift.assignedAdHocId) {
    return 1;
  }
  return 0;
}

export function getEffectiveShiftStatus(shift: Shift): 'fully_staffed' | 'partially_staffed' | 'unfilled' | 'adhoc_assigned' {
  if (shift.isAdHoc || (shift.assignedWorkerIds && shift.assignedWorkerIds.some((id) => id.startsWith('adhoc_')))) {
    return 'adhoc_assigned';
  }
  const assigned = getConfirmedAssignedCount(shift);
  if (assigned >= (shift.requiredHeadcount || 1)) {
    return 'fully_staffed';
  }
  if (assigned > 0) {
    return 'partially_staffed';
  }
  return 'unfilled';
}

// Initialize all data with safe migration
export function initializeAppData(): {
  stores: StoreProfile[];
  staff: InHouseStaff[];
  adHoc: AdHocWorker[];
  shifts: Shift[];
  timesheets: TimesheetEntry[];
  broadcasts: AgencyBroadcastRequest[];
  forumPosts: ForumPost[];
  templates: TaskTemplate[];
  activities: ActivityItem[];
  preferences: UserPreferences;
} {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

  // Load stores
  const rawStores = loadFromStorage<StoreProfile[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
  const stores = Array.isArray(rawStores) && rawStores.length > 0 ? rawStores : INITIAL_STORES;

  // Load staff
  const rawStaff = loadFromStorage<InHouseStaff[]>(STORAGE_KEYS.STAFF, INITIAL_IN_HOUSE_STAFF);
  const staff = Array.isArray(rawStaff) && rawStaff.length > 0 ? rawStaff : INITIAL_IN_HOUSE_STAFF;

  // Load adhoc workers
  const rawAdHoc = loadFromStorage<AdHocWorker[]>(STORAGE_KEYS.ADHOC, INITIAL_AD_HOC_WORKERS);
  const adHoc = Array.isArray(rawAdHoc) && rawAdHoc.length > 0 ? rawAdHoc : INITIAL_AD_HOC_WORKERS;

  // Load shifts & normalize
  const rawShifts = loadFromStorage<any[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  const shifts = (Array.isArray(rawShifts) && rawShifts.length > 0 ? rawShifts : INITIAL_SHIFTS).map((s) =>
    normalizeShift(s)
  );

  // Load timesheets
  const rawTimesheets = loadFromStorage<TimesheetEntry[]>(STORAGE_KEYS.TIMESHEETS, INITIAL_TIMESHEETS);
  const timesheets = Array.isArray(rawTimesheets) && rawTimesheets.length > 0 ? rawTimesheets : INITIAL_TIMESHEETS;

  // Load broadcasts
  const rawBroadcasts = loadFromStorage<AgencyBroadcastRequest[]>(STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS);
  const broadcasts = Array.isArray(rawBroadcasts) && rawBroadcasts.length > 0 ? rawBroadcasts : INITIAL_BROADCASTS;

  // Load forum posts
  const rawForum = loadFromStorage<ForumPost[]>(STORAGE_KEYS.FORUM, INITIAL_FORUM_POSTS);
  const forumPosts = Array.isArray(rawForum) && rawForum.length > 0 ? rawForum : INITIAL_FORUM_POSTS;

  // Load templates
  const rawTemplates = loadFromStorage<TaskTemplate[]>(STORAGE_KEYS.TEMPLATES, DEFAULT_TASK_TEMPLATES);
  const templates = Array.isArray(rawTemplates) && rawTemplates.length > 0 ? rawTemplates : DEFAULT_TASK_TEMPLATES;

  // Load activities
  const rawActivities = loadFromStorage<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  const activities = Array.isArray(rawActivities) && rawActivities.length > 0 ? rawActivities : INITIAL_ACTIVITIES;

  // Load preferences
  const rawPreferences = loadFromStorage<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  const preferences = { ...DEFAULT_PREFERENCES, ...(rawPreferences || {}) };

  // Set current version tag
  if (!currentVersion) {
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
  }

  return {
    stores,
    staff,
    adHoc,
    shifts,
    timesheets,
    broadcasts,
    forumPosts,
    templates,
    activities,
    preferences,
  };
}

// JSON export of entire application state
export function exportAllDataAsJSON(state: {
  stores: StoreProfile[];
  staff: InHouseStaff[];
  adHoc: AdHocWorker[];
  shifts: Shift[];
  timesheets: TimesheetEntry[];
  broadcasts: AgencyBroadcastRequest[];
  forumPosts: ForumPost[];
  templates: TaskTemplate[];
  activities: ActivityItem[];
  preferences: UserPreferences;
}): string {
  const payload = {
    appName: 'Weekly Roster & Shift Operations',
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    environment: 'demo_localstorage',
    data: state,
  };
  return JSON.stringify(payload, null, 2);
}

// JSON import validation and restoration
export function parseAndValidateImportJSON(jsonString: string): {
  success: boolean;
  data?: any;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const targetData = parsed.data || parsed;

    if (!targetData.shifts && !targetData.staff && !targetData.stores) {
      return {
        success: false,
        error: 'Invalid backup file: missing core shifts, staff, or stores dataset.',
      };
    }

    return {
      success: true,
      data: {
        stores: Array.isArray(targetData.stores) ? targetData.stores : INITIAL_STORES,
        staff: Array.isArray(targetData.staff) ? targetData.staff : INITIAL_IN_HOUSE_STAFF,
        adHoc: Array.isArray(targetData.adHoc) ? targetData.adHoc : INITIAL_AD_HOC_WORKERS,
        shifts: Array.isArray(targetData.shifts) ? targetData.shifts.map((s: any) => normalizeShift(s)) : INITIAL_SHIFTS,
        timesheets: Array.isArray(targetData.timesheets) ? targetData.timesheets : INITIAL_TIMESHEETS,
        broadcasts: Array.isArray(targetData.broadcasts) ? targetData.broadcasts : INITIAL_BROADCASTS,
        forumPosts: Array.isArray(targetData.forumPosts) ? targetData.forumPosts : INITIAL_FORUM_POSTS,
        templates: Array.isArray(targetData.templates) ? targetData.templates : DEFAULT_TASK_TEMPLATES,
        activities: Array.isArray(targetData.activities) ? targetData.activities : INITIAL_ACTIVITIES,
        preferences: targetData.preferences || DEFAULT_PREFERENCES,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON parse error: ${err?.message || 'Invalid format'}`,
    };
  }
}
