import React, { useState, useEffect } from 'react';
import { X, Trash2, Zap, Clock, UserCheck, DollarSign } from 'lucide-react';
import { Shift, ShiftRole, InHouseStaff, AdHocWorker, ShiftTimeSlot, PublicHoliday } from '../types';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit: Shift | null;
  defaultDayIndex: number;
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  onSaveShift: (shift: Shift) => void;
  onDeleteShift?: (shiftId: string) => void;
  onOpenAdHocBooking?: (shift: Shift) => void;
  holidays?: PublicHoliday[];
  activeWeekDays?: { dayIndex: number; dateStr: string; name: string }[];
}

const ROLES: ShiftRole[] = [
  'Barista',
  'Cashier',
  'Kitchen / Cook',
  'Floor Lead',
  'Retail Associate',
  'Inventory / Stock',
];

const TIME_SLOT_PRESETS: { label: ShiftTimeSlot; start: string; end: string; hours: number }[] = [
  { label: 'Morning', start: '07:30', end: '15:30', hours: 8 },
  { label: 'Mid-Day', start: '11:00', end: '19:00', hours: 8 },
  { label: 'Evening', start: '14:30', end: '21:30', hours: 7 },
  { label: 'Full Day', start: '08:00', end: '20:00', hours: 12 },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  shiftToEdit,
  defaultDayIndex,
  inHouseStaff,
  adHocWorkers,
  onSaveShift,
  onDeleteShift,
  onOpenAdHocBooking,
  holidays = [],
  activeWeekDays = [],
}) => {
  const [dayIndex, setDayIndex] = useState(defaultDayIndex);
  const [role, setRole] = useState<ShiftRole>('Barista');
  const [slotType, setSlotType] = useState<ShiftTimeSlot>('Morning');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('15:30');
  const [hours, setHours] = useState(8);
  const [assignmentType, setAssignmentType] = useState<'in_house' | 'adhoc' | 'unassigned' | 'urgent'>('in_house');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedAdHocId, setSelectedAdHocId] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<number>(18);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (shiftToEdit) {
      setDayIndex(shiftToEdit.dayIndex);
      setRole(shiftToEdit.role);
      setSlotType(shiftToEdit.slotType);
      setStartTime(shiftToEdit.startTime);
      setEndTime(shiftToEdit.endTime);
      setHours(shiftToEdit.hours);
      setHourlyRate(shiftToEdit.hourlyRate);
      setNotes(shiftToEdit.notes || '');

      if (shiftToEdit.status === 'urgent_needed') {
        setAssignmentType('urgent');
      } else if (shiftToEdit.isAdHoc && shiftToEdit.assignedAdHocId) {
        setAssignmentType('adhoc');
        setSelectedAdHocId(shiftToEdit.assignedAdHocId);
      } else if (shiftToEdit.assignedStaffId) {
        setAssignmentType('in_house');
        setSelectedStaffId(shiftToEdit.assignedStaffId);
      } else {
        setAssignmentType('unassigned');
      }
    } else {
      setDayIndex(defaultDayIndex);
      setRole('Barista');
      setSlotType('Morning');
      setStartTime('07:30');
      setEndTime('15:30');
      setHours(8);
      setHourlyRate(18);
      setNotes('');
      setAssignmentType('in_house');
      // pre-select first staff that has matching skill and available on this day
      const candidate = inHouseStaff.find(
        (s) => s.skills.includes('Barista') && s.availableDays.includes(defaultDayIndex)
      ) || inHouseStaff[0];
      if (candidate) {
        setSelectedStaffId(candidate.id);
        setHourlyRate(candidate.hourlyRate);
      }
    }
  }, [shiftToEdit, defaultDayIndex, inHouseStaff]);

  if (!isOpen) return null;

  const handleSlotPresetChange = (preset: typeof TIME_SLOT_PRESETS[0]) => {
    setSlotType(preset.label);
    setStartTime(preset.start);
    setEndTime(preset.end);
    setHours(preset.hours);
  };

  const handleStaffChange = (staffId: string) => {
    setSelectedStaffId(staffId);
    const staff = inHouseStaff.find((s) => s.id === staffId);
    if (staff) {
      setHourlyRate(staff.hourlyRate);
    }
  };

  const handleAdHocChange = (adhocId: string) => {
    setSelectedAdHocId(adhocId);
    const worker = adHocWorkers.find((w) => w.id === adhocId);
    if (worker) {
      setHourlyRate(worker.hourlyRate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedShift: Shift = {
      id: shiftToEdit ? shiftToEdit.id : `shift_${Date.now()}`,
      dayIndex,
      dateStr: shiftToEdit ? shiftToEdit.dateStr : `2026-10-${19 + dayIndex}`,
      startTime,
      endTime,
      hours: Number(hours),
      role,
      slotType,
      isAdHoc: assignmentType === 'adhoc',
      status: assignmentType === 'urgent' ? 'urgent_needed' : (assignmentType === 'unassigned' ? 'unassigned' : 'filled'),
      hourlyRate: Number(hourlyRate),
      notes: notes.trim() || undefined,
      assignedStaffId: assignmentType === 'in_house' ? selectedStaffId : undefined,
      assignedAdHocId: assignmentType === 'adhoc' ? selectedAdHocId : undefined,
    };

    onSaveShift(updatedShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {shiftToEdit ? 'Edit Shift Details' : 'Schedule New Shift'}
            </h3>
            <p className="text-xs text-slate-500">
              {DAYS[dayIndex]} · 1-Store Manpower Operation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {(() => {
            const activeDateStr = shiftToEdit?.dateStr || activeWeekDays.find((d) => d.dayIndex === dayIndex)?.dateStr;
            const matchedHoliday = holidays.find((h) => h.date === activeDateStr);
            if (!matchedHoliday) return null;
            return (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                <span className="font-bold">★ Gazetted Public Holiday ({matchedHoliday.name}):</span>
                <span className="text-[11px]">2.0× double pay or premium rates apply for this shift.</span>
              </div>
            );
          })()}

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Day of Week
            </label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day, idx) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => setDayIndex(idx)}
                  className={`py-1.5 text-xs font-medium rounded text-center transition-colors ${
                    dayIndex === idx
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Role & Time Preset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ShiftRole)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Slot Preset
              </label>
              <div className="grid grid-cols-3 gap-1">
                {TIME_SLOT_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => handleSlotPresetChange(preset)}
                    className={`py-1.5 text-[11px] font-medium rounded transition-colors ${
                      slotType === preset.label
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Times & Hours */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-mono font-medium bg-white border border-slate-200 rounded px-2 py-1 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-mono font-medium bg-white border border-slate-200 rounded px-2 py-1 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Shift Hours</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono font-medium bg-white border border-slate-200 rounded px-2 py-1 text-slate-900"
              />
            </div>
          </div>

          {/* Manpower Assignment Type (Key BMC feature: In-house vs Ad-hoc ready pool) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Manpower Fulfillment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setAssignmentType('in_house')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors ${
                  assignmentType === 'in_house'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                In-House Staff
              </button>
              <button
                type="button"
                onClick={() => setAssignmentType('adhoc')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors flex items-center justify-center gap-1 ${
                  assignmentType === 'adhoc'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Ad-Hoc Pool</span>
              </button>
              <button
                type="button"
                onClick={() => setAssignmentType('urgent')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors ${
                  assignmentType === 'urgent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Urgent Shortage
              </button>
              <button
                type="button"
                onClick={() => setAssignmentType('unassigned')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md text-center transition-colors ${
                  assignmentType === 'unassigned'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Open / Unset
              </button>
            </div>
          </div>

          {/* Dynamic selector based on Assignment Type */}
          {assignmentType === 'in_house' && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Select In-House Employee
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => handleStaffChange(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-medium"
              >
                <option value="">-- Choose Staff Member --</option>
                {inHouseStaff.map((staff) => {
                  const isAvailable = staff.availableDays.includes(dayIndex);
                  const hasSkill = staff.skills.includes(role);
                  return (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role}) · ${staff.hourlyRate}/h{' '}
                      {!isAvailable ? '· (Day Off Conflict)' : ''}{' '}
                      {!hasSkill ? '· (Skill Mismatch)' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-500">
                Tip: Auto-scheduler automatically checks availability & skill sets.
              </p>
            </div>
          )}

          {assignmentType === 'adhoc' && (
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-amber-900">
                  Select Verified Casual Contract Worker
                </label>
                <span className="text-[11px] text-amber-700 font-mono">+$4.50 placement fee</span>
              </div>
              <select
                value={selectedAdHocId}
                onChange={(e) => handleAdHocChange(e.target.value)}
                className="w-full text-xs bg-white border border-amber-300 rounded-md px-3 py-2 text-slate-900 font-medium"
              >
                <option value="">-- Choose from Ready Pool --</option>
                {adHocWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} · {worker.primaryRole} · ${worker.hourlyRate}/h · {worker.rating}★ ({worker.completedShiftsCount} shifts)
                  </option>
                ))}
              </select>
              {shiftToEdit && onOpenAdHocBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdHocBooking(shiftToEdit);
                  }}
                  className="w-full text-center text-xs font-semibold text-amber-800 hover:text-amber-900 py-1 underline"
                >
                  Browse Full Marketplace Profiles & Ratings →
                </button>
              )}
            </div>
          )}

          {assignmentType === 'urgent' && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-900">
                    Flagged as Urgent Shortage
                  </h4>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    This shift will be highlighted in bright red on the roster. You can 1-click broadcast it to job portals and agency partners or match directly from the casual pool.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hourly Rate & Store Cost Estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hourly Base Rate ($/hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  step="0.5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono font-medium pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Shift Cost
              </label>
              <div className="text-xs font-mono font-semibold py-2 px-3 bg-slate-100 rounded-lg text-slate-800 tabular-nums">
                ${(hours * hourlyRate + (assignmentType === 'adhoc' ? 4.5 : 0)).toFixed(2)}
                {assignmentType === 'adhoc' && (
                  <span className="text-[10px] text-slate-500 font-sans ml-1">
                    (incl. $4.50 fee)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Operational Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Register opening, weekend rush support, keyholder"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {shiftToEdit && onDeleteShift ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteShift(shiftToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 py-1.5 px-2.5 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Shift</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                {shiftToEdit ? 'Save Changes' : 'Create Shift'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
