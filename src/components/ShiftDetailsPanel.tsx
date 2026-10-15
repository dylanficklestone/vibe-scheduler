import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  UserCheck,
  UserPlus,
  UserMinus,
  Zap,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Shift,
  InHouseStaff,
  AdHocWorker,
  PublicHoliday,
  ShiftRole,
} from '../types';
import { calculateManpowerShortage, getConfirmedAssignedCount, getEffectiveShiftStatus } from '../utils/storage';

interface ShiftDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  holidays: PublicHoliday[];
  onEditShift: (shift: Shift) => void;
  onAssignWorker: (shiftId: string, workerId: string, isAdHoc: boolean) => void;
  onRemoveWorker: (shiftId: string, workerId: string) => void;
  onReportAbsence: (shiftId: string, workerId?: string) => void;
  onFindReplacement: (shift: Shift) => void;
  onDuplicateShift: (shift: Shift) => void;
  onCancelShift: (shiftId: string) => void;
}

export const ShiftDetailsPanel: React.FC<ShiftDetailsPanelProps> = ({
  isOpen,
  onClose,
  shift,
  inHouseStaff,
  adHocWorkers,
  holidays,
  onEditShift,
  onAssignWorker,
  onRemoveWorker,
  onReportAbsence,
  onFindReplacement,
  onDuplicateShift,
  onCancelShift,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !shift) return null;

  const shortage = calculateManpowerShortage(shift);
  const confirmedCount = getConfirmedAssignedCount(shift);
  const isHoliday = holidays.some((h) => h.date === shift.dateStr);
  const matchingHoliday = holidays.find((h) => h.date === shift.dateStr);

  // Assigned workers list
  const assignedWorkerIds = shift.assignedWorkerIds || (
    shift.assignedStaffId ? [shift.assignedStaffId] : shift.assignedAdHocId ? [shift.assignedAdHocId] : []
  );

  const assignedStaffMembers = inHouseStaff.filter((s) => assignedWorkerIds.includes(s.id));
  const assignedAdHocMembers = adHocWorkers.filter((a) => assignedWorkerIds.includes(a.id));

  // Available in-house staff who aren't already assigned to this shift
  const availableCandidates = inHouseStaff.filter((s) => !assignedWorkerIds.includes(s.id));

  // Status badge
  const statusInfo = {
    fully_staffed: { label: 'Fully Staffed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    partially_staffed: { label: 'Partially Staffed', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    unfilled: { label: 'Unfilled Shortage', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    adhoc_assigned: { label: 'Temporary Worker Assigned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  }[getEffectiveShiftStatus(shift)];

  const totalShiftCost = shift.hours * shift.hourlyRate + (shift.isAdHoc ? 4.5 : 0);

  const handleQuickAssign = () => {
    if (!selectedWorkerId) return;
    const isAdHoc = selectedWorkerId.startsWith('adhoc_');
    onAssignWorker(shift.id, selectedWorkerId, isAdHoc);
    setSelectedWorkerId('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {shift.slotType}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {shift.taskName || shift.role}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Role: <strong className="text-slate-700 dark:text-slate-300">{shift.role}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Task Description */}
            {shift.taskDescription && (
              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {shift.taskDescription}
                </p>
              </div>
            )}

            {/* Shift Key Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date
                </span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  {shift.dateStr}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Timing
                </span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  {shift.startTime} - {shift.endTime} ({shift.hours}h)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> Headcount Status
                </span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  {confirmedCount} / {shift.requiredHeadcount} Filled
                </p>
                {shortage > 0 ? (
                  <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                    Shortage: {shortage} worker{shortage > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    No shortage
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Labour Cost
                </span>
                <p className="font-semibold text-slate-900 dark:text-white mt-1">
                  ${totalShiftCost.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  @ ${shift.hourlyRate}/h {shift.isAdHoc && '+ $4.50 fee'}
                </span>
              </div>
            </div>

            {/* Public Holiday Banner if active */}
            {isHoliday && matchingHoliday && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                <CalendarDays className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">
                    Singapore Public Holiday: {matchingHoliday.localName}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5">
                    Workers rostered on gazetted public holidays qualify for double rate or day off in lieu.
                  </p>
                </div>
              </div>
            )}

            {/* Assigned Personnel Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Assigned Personnel ({confirmedCount}/{shift.requiredHeadcount})
                </h3>
              </div>

              {assignedStaffMembers.length === 0 && assignedAdHocMembers.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 text-center">
                  <AlertTriangle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    No Worker Assigned
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    Requires {shift.requiredHeadcount} worker(s) to operate this shift.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Internal staff */}
                  {assignedStaffMembers.map((staff) => (
                    <div
                      key={staff.id}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {staff.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {staff.employmentType} · ${staff.hourlyRate}/h
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onReportAbsence(shift.id, staff.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 rounded-md transition-colors"
                          title="Report employee sick/absent"
                        >
                          Report Absence
                        </button>
                        <button
                          onClick={() => onRemoveWorker(shift.id, staff.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove from this shift"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Temporary workers */}
                  {assignedAdHocMembers.map((adhoc) => (
                    <div
                      key={adhoc.id}
                      className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/30 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={adhoc.avatar}
                          alt={adhoc.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate">
                            {adhoc.name} (Ad-Hoc)
                          </p>
                          <p className="text-[11px] text-blue-700 dark:text-blue-300">
                            {adhoc.verifiedAgency} · ★ {adhoc.rating}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveWorker(shift.id, adhoc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove casual worker"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Assign Dropdown */}
              {shortage > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="flex-1 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Select internal worker to assign...</option>
                    {availableCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role}) · ${c.hourlyRate}/h
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedWorkerId}
                    onClick={handleQuickAssign}
                    className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>

            {/* Shift Notes */}
            {shift.notes && (
              <div className="text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Manager Notes
                </span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
                  "{shift.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2.5">
            {/* Primary Action: Find Replacement if Shortage */}
            {shortage > 0 && (
              <button
                onClick={() => {
                  onFindReplacement(shift);
                  onClose();
                }}
                className="w-full py-2.5 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                Find Replacement from On-Demand Pool
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onEditShift(shift);
                  onClose();
                }}
                className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                Edit Shift
              </button>

              <button
                onClick={() => {
                  onDuplicateShift(shift);
                  onClose();
                }}
                className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-500" />
                Duplicate
              </button>
            </div>

            {/* Delete / Cancel Shift */}
            {showConfirmDelete ? (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                  Delete this shift permanently?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onCancelShift(shift.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="w-full py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel Shift
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
