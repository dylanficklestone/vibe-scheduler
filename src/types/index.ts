export type ShiftRole =
  | 'Barista'
  | 'Cashier'
  | 'Kitchen / Cook'
  | 'Floor Lead'
  | 'Retail Associate'
  | 'Inventory / Stock'
  | 'Dishwasher / Cleaner'
  | 'Supervisor';

export type ShiftTimeSlot = 'Morning' | 'Mid-Day' | 'Evening' | 'Full Day';

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export type StaffingStatus =
  | 'fully_staffed'
  | 'partially_staffed'
  | 'unfilled'
  | 'urgent_needed'
  | 'filled'
  | 'unassigned';

export interface Shift {
  id: string;
  storeId?: string;
  companyName?: string;
  taskName?: string;
  taskDescription?: string;
  dayIndex: number; // 0 = Mon, 1 = Tue, ... 6 = Sun
  dateStr: string; // e.g. '2026-10-19'
  startTime: string; // e.g. '08:00'
  endTime: string; // e.g. '14:00'
  hours: number;
  role: ShiftRole;
  slotType: ShiftTimeSlot;
  requiredHeadcount?: number;
  assignedWorkerIds?: string[]; // IDs of assigned workers (in-house or ad-hoc)
  assignedStaffId?: string; // backwards compatibility
  assignedAdHocId?: string; // backwards compatibility
  isAdHoc: boolean;
  status: StaffingStatus;
  notes?: string;
  hourlyRate: number;
  requiredSkills?: ShiftRole[];
  unpaidBreakMinutes?: number;
  recurringSchedule?: 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly';
  templateId?: string;
}

export interface TaskTemplate {
  id: string;
  taskName: string;
  taskDescription: string;
  role: ShiftRole;
  startTime: string;
  endTime: string;
  hours: number;
  requiredHeadcount: number;
  hourlyRate: number;
  requiredSkills: ShiftRole[];
  slotType: ShiftTimeSlot;
  unpaidBreakMinutes: number;
}

export interface ActivityItem {
  id: string;
  type:
    | 'shift_created'
    | 'worker_assigned'
    | 'absence_reported'
    | 'hiring_request'
    | 'temp_accepted'
    | 'shift_completed';
  title: string;
  description: string;
  timestamp: string; // e.g. '10 mins ago' or formatted string
  timestampMs?: number;
  storeId?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  selectedStoreId: string;
  otThreshold: number;
  employerCpfRate: number;
  weekendAllowance: number;
  phMultiplier: number;
}

export type NavTab =
  | 'dashboard'
  | 'roster'
  | 'calendar'
  | 'staff'
  | 'adhoc'
  | 'emergency'
  | 'availability'
  | 'timesheets'
  | 'salary'
  | 'reports'
  | 'stores'
  | 'community'
  | 'settings';

export interface InHouseStaff {
  id: string;
  name: string;
  avatar: string;
  role: ShiftRole;
  skills: ShiftRole[];
  phone: string;
  email: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'In-House Casual';
  hourlyRate: number;
  weeklyTargetHours: number;
  availableDays: number[]; // 0=Mon, ..., 6=Sun
  blackoutDates: string[];
  notes?: string;
  status?: 'active' | 'on_leave';
}

export interface AdHocWorker {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  primaryRole: ShiftRole;
  skills: ShiftRole[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  placementFee: number; // e.g. $4.50
  distanceKm: number;
  badge: 'Top Rated' | 'Instant Dispatch' | 'Certified Food Handler' | 'Experienced';
  verifiedAgency: string; // e.g. 'QuickCrew Agency' | 'Direct Casual' | 'FastJobs Verified'
  availability: 'Available Immediately' | 'Available Tomorrow' | 'Available Weekends';
  completedShiftsCount: number;
  phone: string;
  bio: string;
}

export interface TimesheetEntry {
  id: string;
  staffName: string;
  isAdHoc: boolean;
  role: ShiftRole;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualClockIn: string;
  actualClockOut: string;
  breakMinutes: number;
  totalHours: number;
  overtimeHours: number;
  hourlyRate: number;
  status: 'pending_approval' | 'approved' | 'disputed';
  discrepancyNote?: string;
}

export interface SalaryBreakdown {
  staffId: string;
  staffName: string;
  isAdHoc: boolean;
  role: ShiftRole;
  scheduledHours: number;
  timesheetHours: number;
  baseHourlyRate: number;
  regularPay: number;
  overtimeHours: number;
  overtimePay: number;
  weekendAllowance: number;
  placementFeeTotal: number;
  grossPay: number;
  employerCpfOrTax: number;
  totalCostToStore: number;
}

export interface AgencyBroadcastRequest {
  id: string;
  role: ShiftRole;
  dateStr: string;
  timeSlot: string;
  urgency: 'Immediate (Next 2 Hours)' | 'Today' | 'Tomorrow';
  hourlyRateOffered: number;
  slotsNeeded: number;
  slotsFilled: number;
  channelsSyndicated: string[];
  createdAt: string;
  status: 'broadcasting' | 'partially_filled' | 'filled';
}

export interface ForumPost {
  id: string;
  author: string;
  storeName: string;
  storeType: string;
  title: string;
  content: string;
  category: 'Roster Advice' | 'Last-Minute Cover' | 'Wage Regulations' | 'Agency Tips';
  upvotes: number;
  repliesCount: number;
  timeAgo: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  type: 'Coffee & Bakery' | 'Retail Boutique' | 'Bistro & Grill';
  location: string;
  operatingHours: string;
  dailyRevenueTarget: number;
  weeklyTargetBudget: number;
}
