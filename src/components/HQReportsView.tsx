import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Settings,
  History,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  Timer,
  CheckCheck,
} from 'lucide-react';
import {
  StoreProfile,
  InHouseStaff,
  AdHocWorker,
  Shift,
  TimesheetEntry,
  PublicHoliday,
  HQReportSchedule,
  HQReportHistoryItem,
} from '../types';
import {
  buildWeeklyReportData,
  fetchHQReportSchedule,
  saveHQReportSchedule,
  fetchHQReportHistory,
  sendWeeklyReportToHQ,
  SendReportResponse,
} from '../services/reportService';
import {
  downloadWeeklyAttendancePdf,
  generateWeeklyAttendancePdf,
} from '../services/pdfReportGenerator';

interface HQReportsViewProps {
  activeStore: StoreProfile;
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  shifts: Shift[];
  timesheets: TimesheetEntry[];
  holidays: PublicHoliday[];
  selectedWeekKey: string;
}

export const HQReportsView: React.FC<HQReportsViewProps> = ({
  activeStore,
  inHouseStaff,
  adHocWorkers,
  shifts,
  timesheets,
  holidays,
  selectedWeekKey,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'schedule' | 'history'>('preview');
  const [schedule, setSchedule] = useState<HQReportSchedule | null>(null);
  const [history, setHistory] = useState<HQReportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deliveryReceipt, setDeliveryReceipt] = useState<SendReportResponse['receipt'] | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Settings form states
  const [enabled, setEnabled] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [deliveryTime, setDeliveryTime] = useState('08:00');
  const [recipientEmail, setRecipientEmail] = useState('snleigh@gmail.com');
  const [ccInput, setCcInput] = useState('');
  const [ccEmails, setCcEmails] = useState<string[]>([
    'hq-ops@shiftpulse.internal',
    'payroll-audit@retailgroup.corp',
  ]);
  const [includeDetailedPunches, setIncludeDetailedPunches] = useState(true);
  const [includeWageEstimates, setIncludeWageEstimates] = useState(true);

  // Load schedule and history
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [sched, hist] = await Promise.all([
          fetchHQReportSchedule(),
          fetchHQReportHistory(),
        ]);
        setSchedule(sched);
        setEnabled(sched.enabled);
        setDayOfWeek(sched.dayOfWeek);
        setDeliveryTime(sched.deliveryTime);
        setRecipientEmail(sched.recipientEmail || 'snleigh@gmail.com');
        setCcEmails(sched.ccEmails || []);
        setIncludeDetailedPunches(sched.includeDetailedPunches);
        setIncludeWageEstimates(sched.includeWageEstimates);
        setHistory(hist);
      } catch (err) {
        console.error('Failed to load HQ report data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute current week date range
  const startDate = '2026-10-19';
  const endDate = '2026-10-25';
  const weekLabel = 'Week 43 (Oct 19 – Oct 25, 2026)';

  // Build report data for current state
  const reportData = schedule
    ? buildWeeklyReportData(
        activeStore,
        inHouseStaff,
        adHocWorkers,
        shifts,
        timesheets,
        holidays,
        schedule,
        weekLabel,
        startDate,
        endDate
      )
    : null;

  const handleDownloadPdf = () => {
    if (!reportData) return;
    downloadWeeklyAttendancePdf(
      reportData,
      `Weekly_Staff_Attendance_Report_${activeStore.name.replace(/[^a-zA-Z0-9]/g, '_')}_${startDate}.pdf`
    );
  };

  const handleSendReportNow = async (method: string = 'Manual Manager Send') => {
    if (!reportData) return;
    setIsSending(true);
    try {
      const response = await sendWeeklyReportToHQ(reportData, method);
      setDeliveryReceipt(response.receipt);
      setIsReceiptModalOpen(true);
      if (response.item) {
        setHistory((prev) => [response.item, ...prev]);
      }
      if (response.schedule) {
        setSchedule(response.schedule);
      }
    } catch (err: any) {
      alert(`Error sending report: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;

    const updated: HQReportSchedule = {
      ...schedule,
      enabled,
      dayOfWeek,
      deliveryTime,
      recipientEmail: recipientEmail.trim(),
      ccEmails,
      includeDetailedPunches,
      includeWageEstimates,
    };

    setIsLoading(true);
    try {
      const saved = await saveHQReportSchedule(updated);
      setSchedule(saved);
      setSaveSuccessMessage('Weekly automation settings saved. Next automated run scheduled.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCcEmail = () => {
    const trimmed = ccInput.trim();
    if (trimmed && !ccEmails.includes(trimmed) && trimmed.includes('@')) {
      setCcEmails([...ccEmails, trimmed]);
      setCcInput('');
    }
  };

  const handleRemoveCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((e) => e !== emailToRemove));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Top Banner / Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white">
                <FileText className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Weekly HQ Attendance & Hours Reporting
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {schedule?.enabled ? 'Weekly Auto-Dispatch Active' : 'Auto-Dispatch Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Automatically compiles certified attendance, clock in/out reconciliations, and hours worked into an executive PDF report and dispatches it directly to Head Office (HQ) every week.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={!reportData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Download compiled weekly PDF report"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => handleSendReportNow('Manual Manager Send')}
              disabled={isSending || !reportData}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting to HQ...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Report to HQ Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Schedule Summary Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Schedule:{' '}
                <strong className="text-slate-900">
                  Every {dayNames[schedule?.dayOfWeek ?? 1]} at {schedule?.deliveryTime || '08:00'}
                </strong>
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Recipient:{' '}
                <strong className="text-slate-900 font-mono">
                  {schedule?.recipientEmail || 'snleigh@gmail.com'}
                </strong>
              </span>
            </div>
            {schedule?.ccEmails && schedule.ccEmails.length > 0 && (
              <>
                <span className="text-slate-300 hidden sm:inline">·</span>
                <span className="text-slate-500 hidden sm:inline">
                  +{schedule.ccEmails.length} CC recipients
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendReportNow('Automated Weekly Dispatch')}
              disabled={isSending}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
              title="Simulate the background automated cron dispatch right now"
            >
              <Timer className="w-3 h-3 text-emerald-600" />
              <span>Test Automatic Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeSubTab === 'preview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Weekly Report Preview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeSubTab === 'schedule'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Automation & Recipient Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeSubTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Dispatch History & Audit Archive ({history.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LIVE REPORT PREVIEW & KPIS */}
      {activeSubTab === 'preview' && reportData && (
        <div className="space-y-6">
          {/* Executive KPI Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Attendance Compliance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                  {reportData.kpis.attendanceRate.toFixed(1)}%
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">Target 95%</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {reportData.kpis.totalStaff} staff members on roster
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Worked Hours
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {reportData.kpis.actualHours.toFixed(1)}h
                </span>
                <span className={`text-[11px] font-medium ${
                  reportData.kpis.varianceHours >= 0 ? 'text-amber-700' : 'text-slate-500'
                }`}>
                  {reportData.kpis.varianceHours >= 0 ? `+${reportData.kpis.varianceHours.toFixed(1)}h` : `${reportData.kpis.varianceHours.toFixed(1)}h`}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Scheduled: {reportData.kpis.scheduledHours.toFixed(1)}h
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Overtime Hours
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono tabular-nums ${
                  reportData.kpis.overtimeHours > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}>
                  {reportData.kpis.overtimeHours.toFixed(1)}h
                </span>
                {reportData.kpis.overtimeHours > 0 ? (
                  <span className="text-[11px] text-amber-600 font-medium">Logged & Audited</span>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-medium">Standard Hours</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {reportData.kpis.discrepanciesCount} clock punch discrepancies
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Est. Weekly Wage Expense
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  ${reportData.kpis.estimatedPayrollCost.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Subject to HQ payroll reconciliation
              </span>
            </div>
          </div>

          {/* Section: Staff Attendance & Hours Summary */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Staff Attendance & Hours Summary (Weekly Breakdown)
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated from POS biometric punch records and roster shifts for {reportData.weekLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Report ID: {reportData.reportNumber}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Staff Member & Role</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Shifts</th>
                    <th className="py-3 px-4 text-right">Sched (h)</th>
                    <th className="py-3 px-4 text-right">Actual (h)</th>
                    <th className="py-3 px-4 text-right">Variance</th>
                    <th className="py-3 px-4 text-right">OT (h)</th>
                    <th className="py-3 px-4 text-center">Punctuality</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Est. Gross</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.staffSummaries.map((s) => (
                    <tr key={s.staffId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.staffName}</div>
                        <div className="text-[11px] text-slate-500">{s.role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          s.isAdHoc
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.employmentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {s.shiftsAttended} / {s.shiftsScheduled}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {s.scheduledHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {s.actualHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {s.varianceHours > 0 ? (
                          <span className="text-amber-700">+{s.varianceHours.toFixed(1)}h</span>
                        ) : s.varianceHours < 0 ? (
                          <span className="text-rose-600">{s.varianceHours.toFixed(1)}h</span>
                        ) : (
                          <span className="text-slate-400">0.0h</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {s.overtimeHours > 0 ? (
                          <span className="font-bold text-amber-700">+{s.overtimeHours.toFixed(1)}h</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`font-semibold ${
                          s.punctualityRate === 100 ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {s.punctualityRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.attendanceStatus === 'Perfect'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : s.attendanceStatus === 'Overtime Flag'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : s.attendanceStatus === 'Late Arrival'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ${s.estimatedGrossPay.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono font-bold text-xs text-slate-900">
                  <tr>
                    <td className="py-3 px-4">Total Report Totals</td>
                    <td className="py-3 px-4">—</td>
                    <td className="py-3 px-4 text-center">
                      {reportData.staffSummaries.reduce((a, s) => a + s.shiftsAttended, 0)} shifts
                    </td>
                    <td className="py-3 px-4 text-right">{reportData.kpis.scheduledHours.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-right">{reportData.kpis.actualHours.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-right">
                      {reportData.kpis.varianceHours >= 0 ? `+${reportData.kpis.varianceHours.toFixed(1)}h` : `${reportData.kpis.varianceHours.toFixed(1)}h`}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-700">
                      {reportData.kpis.overtimeHours.toFixed(1)}h
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-700">
                      {reportData.kpis.attendanceRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">—</td>
                    <td className="py-3 px-4 text-right text-sm">
                      ${reportData.kpis.estimatedPayrollCost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section: Daily Clock Punch Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Daily Clock Punches & Audit Flags
              </h3>
              <p className="text-xs text-slate-500">
                Individual punch recordings attached to the weekly PDF sent to HQ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Staff Member</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4 font-mono">Scheduled</th>
                    <th className="py-2.5 px-4 font-mono">Actual In – Out</th>
                    <th className="py-2.5 px-4 text-center font-mono">Break</th>
                    <th className="py-2.5 px-4 text-right font-mono">Net (h)</th>
                    <th className="py-2.5 px-4">Discrepancy / Manager Notes</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.timesheetEntries.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-700">{t.date}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{t.staffName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{t.role}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {t.scheduledStart} – {t.scheduledEnd}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                        {t.actualClockIn} – {t.actualClockOut}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600">
                        {t.breakMinutes}m
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {t.totalHours.toFixed(1)}h
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {t.discrepancyNote ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            {t.discrepancyNote}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Punctual / Verified</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Store Certification & Verification Seal Preview */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-slate-800 rounded-lg text-amber-400 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold">Store Lead Sign-off & Automated Certification</h4>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Each dispatched report includes cryptographic tracking hash <strong>{reportData.trackingId}</strong> and official store authorization confirming all clockings are audited for HQ payroll.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" />
                <span>Save PDF</span>
              </button>
              <button
                onClick={() => handleSendReportNow('Manual Manager Send')}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-slate-900" />
                <span>Transmit to HQ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUTOMATION & HQ RECIPIENT SETTINGS */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly PDF Dispatch Automation Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure when and to whom the weekly staff attendance and hours worked report is delivered.
              </p>
            </div>
            <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Settings className="w-4 h-4" />
            </span>
          </div>

          {saveSuccessMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  Automate Weekly Report Generation & Email to HQ
                </label>
                <span className="text-[11px] text-slate-500">
                  When enabled, ShiftPulse automatically generates the PDF at your scheduled time and sends it to HQ without requiring manual clicks.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Schedule Day & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                >
                  <option value={1}>Every Monday (Recommended for Weekly Payroll)</option>
                  <option value={2}>Every Tuesday</option>
                  <option value={3}>Every Wednesday</option>
                  <option value={4}>Every Thursday</option>
                  <option value={5}>Every Friday</option>
                  <option value={6}>Every Saturday</option>
                  <option value={0}>Every Sunday</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Captures completed shifts from the previous Monday through Sunday cycle.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Automated Delivery Time
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  HQ local time (Asia/Singapore timezone).
                </span>
              </div>
            </div>

            {/* Recipient HQ Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary HQ Email Recipient
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. hq-payroll@retailgroup.corp or snleigh@gmail.com"
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                The primary Head Office inbox where weekly PDF attachments and compliance audits are delivered.
              </span>
            </div>

            {/* CC Recipients */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CC Recipients (Corporate HR, Store Owners, Audit Leads)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCcEmail();
                    }
                  }}
                  placeholder="Add another email (e.g. ops-director@company.com)"
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddCcEmail}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add CC</span>
                </button>
              </div>

              {/* CC Tags */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {ccEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCcEmail(email)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Scope Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Scope & Attachments
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeDetailedPunches}
                  onChange={(e) => setIncludeDetailedPunches(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Include granular daily clock-in / clock-out audit punch log table</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeWageEstimates}
                  onChange={(e) => setIncludeWageEstimates(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Include estimated gross payroll wages and overtime calculation column</span>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Next Auto-Run: {schedule?.nextScheduledDispatch ? new Date(schedule.nextScheduledDispatch).toLocaleString() : 'Pending'}
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Automation Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: DISPATCH HISTORY & ARCHIVE */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                HQ Weekly PDF Dispatch History & Delivery Receipts
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail of all weekly PDF packages delivered to Head Office
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total Reports Sent: {history.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Report Number</th>
                  <th className="py-3 px-4">Reporting Week</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4">Recipient(s)</th>
                  <th className="py-3 px-4 text-center">Staff Count</th>
                  <th className="py-3 px-4 text-right">Hours Logged</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4">Status & Tracking ID</th>
                  <th className="py-3 px-4 text-right">PDF File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.reportNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {item.weekLabel}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.dispatchedAt}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-900">{item.recipientEmail}</div>
                      {item.ccEmails && item.ccEmails.length > 0 && (
                        <div className="text-[10px] text-slate-400">+{item.ccEmails.length} CC</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {item.totalStaff} staff
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {item.actualHours.toFixed(1)}h
                      {item.overtimeHours > 0 && (
                        <div className="text-[10px] text-amber-700">+{item.overtimeHours.toFixed(1)}h OT</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {item.attendanceRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Delivered
                      </span>
                      <div className="text-[10px] font-mono text-slate-400">{item.trackingId}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        title="Download copy of PDF report"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        <span>{item.fileSizeKb} KB</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELIVERY RECEIPT MODAL */}
      {isReceiptModalOpen && deliveryReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Report Delivered to Head Office (HQ)
                </h3>
                <p className="text-xs text-slate-500">
                  Verified corporate mail transmission & attendance audit receipt
                </p>
              </div>
            </div>

            <div className="my-4 space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Tracking Reference:</span>
                <span className="font-mono font-bold text-slate-900">{deliveryReceipt.trackingId}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Delivery Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  DELIVERED TO HQ INBOX
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Primary Recipient:</span>
                <span className="font-mono font-semibold text-slate-900">{deliveryReceipt.recipient}</span>
              </div>

              {deliveryReceipt.ccRecipients && deliveryReceipt.ccRecipients.length > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">CC Recipient(s):</span>
                  <span className="font-mono text-slate-700 text-[11px] truncate max-w-[240px]">
                    {deliveryReceipt.ccRecipients.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Attachment:</span>
                <span className="font-mono text-slate-900 font-medium">
                  {deliveryReceipt.attachmentName} ({deliveryReceipt.fileSizeKb} KB)
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Relay Protocol & Latency:</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {deliveryReceipt.smtpServer} ({deliveryReceipt.latencyMs}ms)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Save Local PDF Copy</span>
              </button>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
