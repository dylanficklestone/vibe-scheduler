import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Clock,
  UserCheck,
  DollarSign,
  Users,
  Repeat,
  Bookmark,
  Sparkles,
  Coffee,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  Shift,
  ShiftRole,
  InHouseStaff,
  AdHocWorker,
  ShiftTimeSlot,
  StoreProfile,
  TaskTemplate,
} from '../types';
import { DEFAULT_TASK_TEMPLATES } from '../utils/storage';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit: Shift | null;
  defaultDayIndex: number;
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  activeStore: StoreProfile;
  stores: StoreProfile[];
  templates?: TaskTemplate[];
  onSaveShift: (shift: Shift, isRecurring?: boolean, recurringType?: string) => void;
  onDeleteShift?: (shiftId: string) => void;
  onSaveTemplate?: (template: TaskTemplate) => void;
  activeWeekDays?: { dayIndex: number; dateStr: string; name: string; displayDate?: string }[];
}

const ROLES: ShiftRole[] = [
  'Barista',
  'Cashier',
  'Kitchen / Cook',
  'Floor Lead',
  'Retail Associate',
  'Inventory / Stock',
  'Dishwasher / Cleaner',
  'Supervisor',
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
  activeStore,
  stores,
  templates = DEFAULT_TASK_TEMPLATES,
  onSaveShift,
  onDeleteShift,
  onSaveTemplate,
  activeWeekDays = [],
}) => {
  // Form fields
  const [storeId, setStoreId] = useState(activeStore.id);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [role, setRole] = useState<ShiftRole>('Barista');
  const [dayIndex, setDayIndex] = useState(defaultDayIndex);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('15:30');
  const [slotType, setSlotType] = useState<ShiftTimeSlot>('Morning');
  const [requiredHeadcount, setRequiredHeadcount] = useState<number>(1);
  const [hourlyRate, setHourlyRate] = useState<number>(18);
  const [requiredSkills, setRequiredSkills] = useState<ShiftRole[]>(['Barista']);
  const [unpaidBreakMinutes, setUnpaidBreakMinutes] = useState<number>(30);
  const [recurringSchedule, setRecurringSchedule] = useState<'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly'>('none');
  const [notes, setNotes] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Worker assignment (supports multi-worker assignment)
  const [assignedWorkerIds, setAssignedWorkerIds] = useState<string[]>([]);

  // Calculation of hours
  const calculateHours = (start: string, end: string, breakMins: number = 0) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = endH * 60 + endM - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60; // overnight
    const netMins = Math.max(diff - breakMins, 30);
    return Math.round((netMins / 60) * 10) / 10;
  };

  const hours = calculateHours(startTime, endTime, unpaidBreakMinutes);
  const shortage = Math.max(requiredHeadcount - assignedWorkerIds.length, 0);

  // Populate on open or edit
  useEffect(() => {
    if (shiftToEdit) {
      setStoreId(shiftToEdit.storeId || activeStore.id);
      setTaskName(shiftToEdit.taskName || `${shiftToEdit.role} Shift`);
      setTaskDescription(shiftToEdit.taskDescription || '');
      setRole(shiftToEdit.role);
      setDayIndex(shiftToEdit.dayIndex);
      setStartTime(shiftToEdit.startTime);
      setEndTime(shiftToEdit.endTime);
      setSlotType(shiftToEdit.slotType);
      setRequiredHeadcount(shiftToEdit.requiredHeadcount || 1);
      setHourlyRate(shiftToEdit.hourlyRate);
      setRequiredSkills(shiftToEdit.requiredSkills || [shiftToEdit.role]);
      setUnpaidBreakMinutes(shiftToEdit.unpaidBreakMinutes ?? 30);
      setRecurringSchedule(shiftToEdit.recurringSchedule || 'none');
      setNotes(shiftToEdit.notes || '');

      const currentAssigned = shiftToEdit.assignedWorkerIds?.length
        ? [...shiftToEdit.assignedWorkerIds]
        : shiftToEdit.assignedStaffId
        ? [shiftToEdit.assignedStaffId]
        : shiftToEdit.assignedAdHocId
        ? [shiftToEdit.assignedAdHocId]
        : [];
      setAssignedWorkerIds(currentAssigned);
    } else {
      setStoreId(activeStore.id);
      setTaskName('Morning Barista Opening');
      setTaskDescription('Espresso machine dial-in, opening register, pastry display setup.');
      setRole('Barista');
      setDayIndex(defaultDayIndex);
      setStartTime('07:30');
      setEndTime('15:30');
      setSlotType('Morning');
      setRequiredHeadcount(1);
      setHourlyRate(18);
      setRequiredSkills(['Barista']);
      setUnpaidBreakMinutes(30);
      setRecurringSchedule('none');
      setNotes('');
      setSaveAsTemplate(false);

      // Pre-select first eligible candidate if available
      const candidate = inHouseStaff.find(
        (s) => s.skills.includes('Barista') && s.availableDays.includes(defaultDayIndex)
      );
      setAssignedWorkerIds(candidate ? [candidate.id] : []);
    }
  }, [shiftToEdit, defaultDayIndex, activeStore, inHouseStaff, isOpen]);

  if (!isOpen) return null;

  // Apply a template
  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = templates.find((t) => t.id === tmplId);
    if (!tmpl) return;
    setTaskName(tmpl.taskName);
    setTaskDescription(tmpl.taskDescription);
    setRole(tmpl.role);
    setStartTime(tmpl.startTime);
    setEndTime(tmpl.endTime);
    setSlotType(tmpl.slotType);
    setRequiredHeadcount(tmpl.requiredHeadcount);
    setHourlyRate(tmpl.hourlyRate);
    setRequiredSkills(tmpl.requiredSkills);
    setUnpaidBreakMinutes(tmpl.unpaidBreakMinutes);
  };

  const toggleWorkerAssignment = (workerId: string) => {
    setAssignedWorkerIds((prev) => {
      if (prev.includes(workerId)) {
        return prev.filter((id) => id !== workerId);
      }
      return [...prev, workerId];
    });
  };

  const toggleSkill = (skill: ShiftRole) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handlePresetSlot = (preset: (typeof TIME_SLOT_PRESETS)[0]) => {
    setSlotType(preset.label);
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateStr =
      activeWeekDays[dayIndex]?.dateStr ||
      shiftToEdit?.dateStr ||
      `2026-10-${19 + dayIndex}`;

    const isAdHoc = assignedWorkerIds.some((id) => id.startsWith('adhoc_'));
    const staffId = assignedWorkerIds.find((id) => id.startsWith('staff_'));
    const adHocId = assignedWorkerIds.find((id) => id.startsWith('adhoc_'));

    // Status derivation
    let status: any = 'unfilled';
    if (isAdHoc) {
      status = 'filled';
    } else if (assignedWorkerIds.length >= requiredHeadcount) {
      status = 'fully_staffed';
    } else if (assignedWorkerIds.length > 0) {
      status = 'partially_staffed';
    } else {
      status = 'urgent_needed';
    }

    const savedShift: Shift = {
      id: shiftToEdit ? shiftToEdit.id : `shift_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      storeId,
      companyName: stores.find((s) => s.id === storeId)?.name || activeStore.name,
      taskName: taskName.trim() || `${role} Shift`,
      taskDescription: taskDescription.trim(),
      dayIndex,
      dateStr,
      startTime,
      endTime,
      hours,
      role,
      slotType,
      requiredHeadcount: Number(requiredHeadcount) || 1,
      assignedWorkerIds,
      assignedStaffId: staffId,
      assignedAdHocId: adHocId,
      isAdHoc,
      status,
      notes: notes.trim(),
      hourlyRate: Number(hourlyRate) || 18,
      requiredSkills,
      unpaidBreakMinutes,
      recurringSchedule,
    };

    // If manager ticked "Save as reusable template"
    if (saveAsTemplate && onSaveTemplate) {
      onSaveTemplate({
        id: `tmpl_${Date.now()}`,
        taskName: savedShift.taskName || `${role} Shift`,
        taskDescription: savedShift.taskDescription || '',
        role: savedShift.role,
        startTime: savedShift.startTime,
        endTime: savedShift.endTime,
        hours: savedShift.hours,
        requiredHeadcount: Number(savedShift.requiredHeadcount) || 1,
        hourlyRate: savedShift.hourlyRate,
        requiredSkills: savedShift.requiredSkills || [savedShift.role],
        slotType: savedShift.slotType,
        unpaidBreakMinutes: savedShift.unpaidBreakMinutes || 30,
      });
    }

    onSaveShift(savedShift, recurringSchedule !== 'none', recurringSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {shiftToEdit ? 'Edit Operational Shift' : 'Create Task & Shift Schedule'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify required headcount, schedule, role requirements, and worker assignments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick Loader */}
        {!shiftToEdit && templates.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" /> Apply Saved Template:
            </span>
            <select
              onChange={(e) => handleApplyTemplate(e.target.value)}
              defaultValue=""
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="" disabled>
                Select template...
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.taskName} ({t.role} · {t.hours}h)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Outlet / Stall & Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Stall / Outlet *
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Day of Week *
              </label>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                {DAYS.map((dayName, idx) => (
                  <option key={dayName} value={idx}>
                    {dayName} {activeWeekDays[idx]?.displayDate ? `(${activeWeekDays[idx]?.displayDate})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Task Name & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Task / Shift Name *
              </label>
              <input
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Morning Barista & Register Opening"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Primary Job Role *
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as ShiftRole;
                  setRole(newRole);
                  if (!requiredSkills.includes(newRole)) {
                    setRequiredSkills([newRole]);
                  }
                }}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Task Description & Operating Procedures
            </label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Outline specific responsibilities, closing checklist items, or hygiene requirements..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Slot Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Time Slot Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_SLOT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handlePresetSlot(preset)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    slotType === preset.label
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div>{preset.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {preset.start} - {preset.end}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Timing & Duration Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Unpaid Break</label>
              <select
                value={unpaidBreakMinutes}
                onChange={(e) => setUnpaidBreakMinutes(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
              >
                <option value={0}>No Break (0m)</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Net Paid Hours</label>
              <div className="p-2 font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                {hours}h
              </div>
            </div>
          </div>

          {/* Headcount, Hourly Rate & Shortage Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Required Headcount *</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={requiredHeadcount}
                  onChange={(e) => setRequiredHeadcount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold font-mono text-center text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Number of staff needed on shift</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Hourly Base Rate ($/h) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  min={10}
                  max={60}
                  step={0.5}
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-7 p-2.5 font-bold font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Total: ${(hours * hourlyRate).toFixed(2)}/person</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Manpower Calculation
              </label>
              <div className={`p-2.5 rounded-xl border text-xs ${
                shortage > 0
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Assigned: {assignedWorkerIds.length}</span>
                  <span className={shortage > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {shortage > 0 ? `Shortage: -${shortage}` : 'Fully Covered'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Formula: MAX(Required - Confirmed, 0)
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills Multi-select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Required Skills & Certifications
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((skill) => {
                const isSelected = requiredSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign In-House Workers */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Assign Internal Staff ({assignedWorkerIds.length} / {requiredHeadcount} selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-850/40">
              {inHouseStaff.map((staff) => {
                const isAssigned = assignedWorkerIds.includes(staff.id);
                const isAvailable = staff.availableDays.includes(dayIndex);
                const hasSkill = staff.skills.includes(role);

                return (
                  <label
                    key={staff.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isAssigned
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => toggleWorkerAssignment(staff.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{staff.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>${staff.hourlyRate}/h</span>
                        {hasSkill && <span className="text-emerald-500">✓ Skilled</span>}
                        {!isAvailable && <span className="text-amber-500">⚠ Off-day</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Recurring Schedule Option */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-indigo-500" /> Recurring Schedule Pattern
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically replicate this shift across multiple days of the week.
              </p>
            </div>
            <select
              value={recurringSchedule}
              onChange={(e) => setRecurringSchedule(e.target.value as any)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">One-off Shift (No repeat)</option>
              <option value="daily">Daily (Mon - Sun, 7 days)</option>
              <option value="weekdays">Weekdays Only (Mon - Fri)</option>
              <option value="weekends">Weekends Only (Sat - Sun)</option>
              <option value="weekly">Weekly on this day</option>
            </select>
          </div>

          {/* Notes & Template Checkbox */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Shift Notes / Handover Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Expect heavy delivery intake at 10am; verify milk fridge temp."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {!shiftToEdit && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-medium">
                  Save as reusable task template for future fast 1-click scheduling
                </span>
              </label>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              {shiftToEdit && onDeleteShift && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteShift(shiftToEdit.id);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Shift
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {shiftToEdit ? 'Save Shift Changes' : 'Publish to Roster'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
