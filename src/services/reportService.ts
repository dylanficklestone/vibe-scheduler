import {
  HQReportSchedule,
  HQReportHistoryItem,
  StaffAttendanceSummary,
  Shift,
  TimesheetEntry,
  InHouseStaff,
  AdHocWorker,
  StoreProfile,
  PublicHoliday,
} from '../types';
import { WeeklyReportPdfData } from './pdfReportGenerator';

export const DEFAULT_SCHEDULE: HQReportSchedule = {
  id: 'hq_sched_default',
  enabled: true,
  frequency: 'weekly',
  dayOfWeek: 1, // Monday
  deliveryTime: '08:00',
  timezone: 'Asia/Singapore',
  recipientEmail: 'snleigh@gmail.com',
  ccEmails: ['hq-ops@shiftpulse.internal', 'payroll-audit@retailgroup.corp'],
  storeId: 'store_1',
  storeName: 'Roast & Bloom Bakery & Café',
  includeDetailedPunches: true,
  includeWageEstimates: true,
  includeDiscrepanciesOnly: false,
  lastDispatchedAt: '2026-10-12T08:00:14.000Z',
  nextScheduledDispatch: '2026-10-19T08:00:00.000Z',
};

// Compute attendance summary for all staff
export function computeStaffAttendanceSummaries(
  inHouseStaff: InHouseStaff[],
  adHocWorkers: AdHocWorker[],
  shifts: Shift[],
  timesheets: TimesheetEntry[],
  holidays: PublicHoliday[]
): {
  summaries: StaffAttendanceSummary[];
  kpis: {
    totalStaff: number;
    scheduledHours: number;
    actualHours: number;
    varianceHours: number;
    attendanceRate: number;
    overtimeHours: number;
    discrepanciesCount: number;
    estimatedPayrollCost: number;
  };
} {
  const summaries: StaffAttendanceSummary[] = [];

  // In-House Staff
  inHouseStaff.forEach((staff) => {
    const staffShifts = shifts.filter((s) => s.assignedStaffId === staff.id);
    const scheduledHours = staffShifts.reduce((acc, s) => acc + s.hours, 0);

    const staffPunches = timesheets.filter((t) =>
      t.staffName.toLowerCase().includes(staff.name.toLowerCase())
    );

    const actualHours = staffPunches.length > 0
      ? staffPunches.reduce((acc, t) => acc + t.totalHours, 0)
      : scheduledHours;

    const overtimeHours = staffPunches.reduce((acc, t) => acc + t.overtimeHours, 0);
    const discrepancies = staffPunches.filter((t) => !!t.discrepancyNote).length;

    const shiftsScheduled = staffShifts.length > 0 ? staffShifts.length : 5;
    const shiftsAttended = staffPunches.length > 0 ? staffPunches.length : shiftsScheduled;

    const varianceHours = parseFloat((actualHours - scheduledHours).toFixed(2));

    // Punctuality rate
    let lateCount = 0;
    staffPunches.forEach((p) => {
      if (p.discrepancyNote && p.discrepancyNote.toLowerCase().includes('late')) {
        lateCount++;
      }
    });
    const punctualityRate = staffPunches.length > 0
      ? Math.round(((staffPunches.length - lateCount) / staffPunches.length) * 100)
      : 100;

    let status: StaffAttendanceSummary['attendanceStatus'] = 'Perfect';
    if (discrepancies > 0 && lateCount > 0) status = 'Late Arrival';
    else if (overtimeHours > 0) status = 'Overtime Flag';
    else if (varianceHours < -2) status = 'Under Hours';
    else if (varianceHours === 0) status = 'Perfect';
    else status = 'On-Track';

    const regularHours = Math.max(0, actualHours - overtimeHours);
    const estimatedGrossPay = parseFloat(
      (regularHours * staff.hourlyRate + overtimeHours * staff.hourlyRate * 1.5).toFixed(2)
    );

    summaries.push({
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      employmentType: staff.employmentType,
      isAdHoc: false,
      shiftsScheduled,
      shiftsAttended,
      scheduledHours: parseFloat(scheduledHours.toFixed(1)),
      actualHours: parseFloat(actualHours.toFixed(1)),
      varianceHours,
      overtimeHours: parseFloat(overtimeHours.toFixed(1)),
      punctualityRate,
      attendanceStatus: status,
      discrepanciesCount: discrepancies,
      hourlyRate: staff.hourlyRate,
      estimatedGrossPay,
    });
  });

  // Check if any Ad-Hoc workers worked
  const adHocPunches = timesheets.filter((t) => t.isAdHoc || t.staffName.includes('(Ad-Hoc)'));
  adHocPunches.forEach((punch) => {
    const existing = summaries.find((s) => s.staffName === punch.staffName);
    if (!existing) {
      const matchWorker = adHocWorkers.find((w) =>
        punch.staffName.toLowerCase().includes(w.name.toLowerCase())
      );
      const rate = punch.hourlyRate || (matchWorker ? matchWorker.hourlyRate : 20);
      summaries.push({
        staffId: `adhoc_${Date.now()}_${punch.id}`,
        staffName: punch.staffName,
        role: punch.role,
        employmentType: 'Ad-Hoc Casual',
        isAdHoc: true,
        shiftsScheduled: 1,
        shiftsAttended: 1,
        scheduledHours: parseFloat(punch.totalHours.toFixed(1)),
        actualHours: parseFloat(punch.totalHours.toFixed(1)),
        varianceHours: 0,
        overtimeHours: punch.overtimeHours,
        punctualityRate: 100,
        attendanceStatus: 'On-Track',
        discrepanciesCount: punch.discrepancyNote ? 1 : 0,
        hourlyRate: rate,
        estimatedGrossPay: parseFloat((punch.totalHours * rate).toFixed(2)),
      });
    }
  });

  // Calculate overall KPIs
  const totalStaff = summaries.length;
  const scheduledHours = summaries.reduce((acc, s) => acc + s.scheduledHours, 0);
  const actualHours = summaries.reduce((acc, s) => acc + s.actualHours, 0);
  const varianceHours = parseFloat((actualHours - scheduledHours).toFixed(2));
  const overtimeHours = summaries.reduce((acc, s) => acc + s.overtimeHours, 0);
  const discrepanciesCount = timesheets.filter((t) => !!t.discrepancyNote).length;
  const estimatedPayrollCost = summaries.reduce((acc, s) => acc + s.estimatedGrossPay, 0);

  // Overall attendance rate %
  const totalScheduledShifts = summaries.reduce((acc, s) => acc + s.shiftsScheduled, 0);
  const totalAttendedShifts = summaries.reduce((acc, s) => acc + s.shiftsAttended, 0);
  const attendanceRate = totalScheduledShifts > 0
    ? Math.min(100, parseFloat(((totalAttendedShifts / totalScheduledShifts) * 100).toFixed(1)))
    : 100;

  return {
    summaries,
    kpis: {
      totalStaff,
      scheduledHours: parseFloat(scheduledHours.toFixed(1)),
      actualHours: parseFloat(actualHours.toFixed(1)),
      varianceHours,
      attendanceRate,
      overtimeHours: parseFloat(overtimeHours.toFixed(1)),
      discrepanciesCount,
      estimatedPayrollCost: parseFloat(estimatedPayrollCost.toFixed(2)),
    },
  };
}

// Assemble full report PDF data object
export function buildWeeklyReportData(
  store: StoreProfile,
  inHouseStaff: InHouseStaff[],
  adHocWorkers: AdHocWorker[],
  shifts: Shift[],
  timesheets: TimesheetEntry[],
  holidays: PublicHoliday[],
  schedule: HQReportSchedule,
  weekLabel: string = 'Week 43 (Oct 19 – Oct 25, 2026)',
  startDate: string = '2026-10-19',
  endDate: string = '2026-10-25'
): WeeklyReportPdfData {
  const { summaries, kpis } = computeStaffAttendanceSummaries(
    inHouseStaff,
    adHocWorkers,
    shifts,
    timesheets,
    holidays
  );

  const formattedNow = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Singapore',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return {
    reportNumber: 'HQ-REP-2026-W43',
    store,
    weekLabel,
    startDate,
    endDate,
    recipientEmail: schedule.recipientEmail,
    ccEmails: schedule.ccEmails,
    kpis,
    staffSummaries: summaries,
    timesheetEntries: timesheets,
    generatedAt: formattedNow,
    trackingId: `TRK-HQ-2026-W43-${Math.floor(1000 + Math.random() * 9000)}`,
  };
}

// API Calls
export async function fetchHQReportSchedule(): Promise<HQReportSchedule> {
  try {
    const res = await fetch('/api/reports/schedule');
    if (res.ok) {
      const data = await res.json();
      if (data.schedule) return data.schedule;
    }
  } catch (err) {
    console.warn('Using local fallback for HQ report schedule:', err);
  }
  return DEFAULT_SCHEDULE;
}

export async function saveHQReportSchedule(schedule: HQReportSchedule): Promise<HQReportSchedule> {
  try {
    const res = await fetch('/api/reports/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    if (res.ok) {
      const data = await res.json();
      return data.schedule;
    }
  } catch (err) {
    console.warn('Failed to save to server, using local updated schedule:', err);
  }
  return schedule;
}

export async function fetchHQReportHistory(): Promise<HQReportHistoryItem[]> {
  try {
    const res = await fetch('/api/reports/history');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.history)) return data.history;
    }
  } catch (err) {
    console.warn('Failed to fetch report history from API:', err);
  }
  return [];
}

export interface SendReportResponse {
  success: boolean;
  message: string;
  receipt: {
    trackingId: string;
    timestamp: string;
    status: string;
    smtpServer: string;
    recipient: string;
    ccRecipients: string[];
    attachmentName: string;
    fileSizeKb: number;
    latencyMs: number;
  };
  item: HQReportHistoryItem;
  schedule: HQReportSchedule;
}

export async function sendWeeklyReportToHQ(
  reportData: WeeklyReportPdfData,
  deliveryMethod: string = 'Automated Weekly Dispatch'
): Promise<SendReportResponse> {
  const payload = {
    weekLabel: reportData.weekLabel,
    startDate: reportData.startDate,
    endDate: reportData.endDate,
    recipientEmail: reportData.recipientEmail,
    ccEmails: reportData.ccEmails,
    kpis: reportData.kpis,
    fileName: `Weekly_Attendance_Report_${reportData.store.name.replace(/[^a-zA-Z0-9]/g, '_')}_${reportData.startDate}.pdf`,
    deliveryMethod,
  };

  const res = await fetch('/api/reports/send-weekly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to dispatch report: ${res.statusText}`);
  }

  return await res.json();
}
