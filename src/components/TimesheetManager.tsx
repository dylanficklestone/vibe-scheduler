import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Check,
  Plus,
  Filter,
  CheckCheck,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import { TimesheetEntry, ShiftRole } from '../types';

interface TimesheetManagerProps {
  timesheets: TimesheetEntry[];
  onApproveTimesheet: (id: string) => void;
  onApproveAll: () => void;
  onAddTimesheet: (entry: TimesheetEntry) => void;
  onUpdateTimesheet: (entry: TimesheetEntry) => void;
  onNavigateToHQReports?: () => void;
}

export const TimesheetManager: React.FC<TimesheetManagerProps> = ({
  timesheets,
  onApproveTimesheet,
  onApproveAll,
  onAddTimesheet,
  onUpdateTimesheet,
  onNavigateToHQReports,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);

  // Form states
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState<ShiftRole>('Barista');
  const [date, setDate] = useState('2026-10-20');
  const [schedStart, setSchedStart] = useState('08:00');
  const [schedEnd, setSchedEnd] = useState('16:00');
  const [clockIn, setClockIn] = useState('07:58');
  const [clockOut, setClockOut] = useState('16:05');
  const [breakMins, setBreakMins] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(18);
  const [discrepancyNote, setDiscrepancyNote] = useState('');

  const filteredEntries = timesheets.filter((t) => {
    if (filter === 'pending') return t.status === 'pending_approval';
    if (filter === 'approved') return t.status === 'approved';
    return true;
  });

  const pendingCount = timesheets.filter((t) => t.status === 'pending_approval').length;
  const totalApprovedHours = timesheets
    .filter((t) => t.status === 'approved')
    .reduce((acc, t) => acc + t.totalHours, 0);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setStaffName('');
    setRole('Barista');
    setDate('2026-10-21');
    setSchedStart('08:00');
    setSchedEnd('14:00');
    setClockIn('08:00');
    setClockOut('14:00');
    setBreakMins(15);
    setHourlyRate(18);
    setDiscrepancyNote('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setStaffName(entry.staffName);
    setRole(entry.role);
    setDate(entry.date);
    setSchedStart(entry.scheduledStart);
    setSchedEnd(entry.scheduledEnd);
    setClockIn(entry.actualClockIn);
    setClockOut(entry.actualClockOut);
    setBreakMins(entry.breakMinutes);
    setHourlyRate(entry.hourlyRate);
    setDiscrepancyNote(entry.discrepancyNote || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // calculate total hours roughly
    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM) - breakMins;
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const computedHours = Math.max(0, parseFloat((diffMinutes / 60).toFixed(2)));

    const entry: TimesheetEntry = {
      id: editingEntry ? editingEntry.id : `ts_${Date.now()}`,
      staffName: staffName.trim() || 'Staff Worker',
      isAdHoc: editingEntry ? editingEntry.isAdHoc : staffName.includes('(Ad-Hoc)'),
      role,
      date,
      scheduledStart: schedStart,
      scheduledEnd: schedEnd,
      actualClockIn: clockIn,
      actualClockOut: clockOut,
      breakMinutes: breakMins,
      totalHours: computedHours,
      overtimeHours: computedHours > 8 ? parseFloat((computedHours - 8).toFixed(2)) : 0,
      hourlyRate: Number(hourlyRate),
      status: 'pending_approval',
      discrepancyNote: discrepancyNote.trim() || undefined,
    };

    if (editingEntry) {
      onUpdateTimesheet(entry);
    } else {
      onAddTimesheet(entry);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white">
                <Clock className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Timesheet Management & Clock Punches
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Audit actual attendance, reconcile scheduled vs clock-in times, review late arrival / overtime flags, and verify hours for automated wage calculation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                onClick={onApproveAll}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approve All Pending ({pendingCount})</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual Punch</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Total Entries</span>
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {timesheets.length} punches
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Pending Supervisor Approval</span>
            <span className={`text-base font-bold font-mono tabular-nums ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {pendingCount} records
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Approved Payroll Hours</span>
            <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
              {totalApprovedHours.toFixed(1)} hrs
            </span>
          </div>
        </div>

        {/* Weekly HQ Automated PDF Dispatch Info Callout */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 -mx-5 -mb-5 px-5 py-3.5 rounded-b-xl">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-md bg-slate-900 text-white shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Weekly Staff Attendance & Hours PDF Report to HQ
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Dispatch: Mondays 08:00 AM
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Weekly attendance, hours worked, and overtime audit logs are automatically formatted as a PDF and dispatched to HQ payroll.
              </p>
            </div>
          </div>

          {onNavigateToHQReports && (
            <button
              onClick={onNavigateToHQReports}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>HQ Report Control Center</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">Filter Status:</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({timesheets.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                filter === 'pending' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                filter === 'approved' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved ({timesheets.length - pendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Staff Member & Role</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Scheduled Shift</th>
                <th className="py-3 px-4">Actual Clock In / Out</th>
                <th className="py-3 px-4 text-right">Net Hours</th>
                <th className="py-3 px-4 text-right">Base Rate</th>
                <th className="py-3 px-4">Status & Discrepancies</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => {
                const isPending = entry.status === 'pending_approval';

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Staff & Role */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{entry.staffName}</div>
                      <div className="text-[11px] text-slate-500">
                        {entry.role} {entry.isAdHoc ? '· (Ad-Hoc Casual)' : '· (In-House)'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {entry.date}
                    </td>

                    {/* Scheduled */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {entry.scheduledStart} – {entry.scheduledEnd}
                    </td>

                    {/* Actual Clock */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-900">
                        {entry.actualClockIn} – {entry.actualClockOut}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Break: {entry.breakMinutes}m
                      </div>
                    </td>

                    {/* Net Hours */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {entry.totalHours.toFixed(2)}h
                      {entry.overtimeHours > 0 && (
                        <div className="text-[10px] text-amber-600 font-sans">
                          +{entry.overtimeHours}h OT
                        </div>
                      )}
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      ${entry.hourlyRate.toFixed(2)}/h
                    </td>

                    {/* Status & Discrepancy */}
                    <td className="py-3 px-4">
                      {entry.discrepancyNote ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Audit Flag</span>
                          </span>
                          <p className="text-[10px] text-slate-500 max-w-xs leading-tight">
                            {entry.discrepancyNote}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Punctual</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending ? (
                          <button
                            onClick={() => onApproveTimesheet(entry.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleOpenEdit(entry)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Punch / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              {editingEntry ? 'Edit Timesheet Record' : 'Log Manual Clock Punch'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record punch-in / punch-out or correct missed clockings.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Worker Name
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ShiftRole)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-900"
                  >
                    <option value="Barista">Barista</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Kitchen / Cook">Kitchen / Cook</option>
                    <option value="Floor Lead">Floor Lead</option>
                    <option value="Retail Associate">Retail Associate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Actual Clock In</label>
                  <input
                    type="time"
                    value={clockIn}
                    onChange={(e) => setClockIn(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Actual Clock Out</label>
                  <input
                    type="time"
                    value={clockOut}
                    onChange={(e) => setClockOut(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Break (Mins)</label>
                  <input
                    type="number"
                    value={breakMins}
                    onChange={(e) => setBreakMins(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Wage ($/hr)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discrepancy / Audit Note</label>
                <input
                  type="text"
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  placeholder="e.g. Approved 30 mins inventory overtime"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {editingEntry ? 'Save Entry' : 'Log Punch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
