import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Calendar,
  Check,
  X,
  Shield,
} from 'lucide-react';
import { InHouseStaff, ShiftRole, Shift } from '../types';

interface StaffDirectoryProps {
  staffList: InHouseStaff[];
  shifts: Shift[];
  onAddStaff: (newStaff: InHouseStaff) => void;
  onUpdateStaff: (updatedStaff: InHouseStaff) => void;
  onDeleteStaff: (staffId: string) => void;
}

const ALL_ROLES: ShiftRole[] = [
  'Floor Lead',
  'Barista',
  'Cashier',
  'Kitchen / Cook',
  'Retail Associate',
  'Inventory / Stock',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({
  staffList,
  shifts,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [editingStaff, setEditingStaff] = useState<InHouseStaff | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<ShiftRole>('Barista');
  const [skills, setSkills] = useState<ShiftRole[]>(['Barista']);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Part-Time' | 'In-House Casual'>('Part-Time');
  const [hourlyRate, setHourlyRate] = useState<number>(18);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(24);
  const [availableDays, setAvailableDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingStaff(null);
    setName('');
    setRole('Barista');
    setSkills(['Barista']);
    setPhone('');
    setEmail('');
    setEmploymentType('Part-Time');
    setHourlyRate(18);
    setWeeklyTargetHours(24);
    setAvailableDays([0, 1, 2, 3, 4]);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (staff: InHouseStaff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setRole(staff.role);
    setSkills(staff.skills);
    setPhone(staff.phone);
    setEmail(staff.email);
    setEmploymentType(staff.employmentType);
    setHourlyRate(staff.hourlyRate);
    setWeeklyTargetHours(staff.weeklyTargetHours);
    setAvailableDays(staff.availableDays);
    setNotes(staff.notes || '');
    setIsModalOpen(true);
  };

  const toggleSkill = (s: ShiftRole) => {
    if (skills.includes(s)) {
      if (skills.length > 1) {
        setSkills(skills.filter((x) => x !== s));
      }
    } else {
      setSkills([...skills, s]);
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (availableDays.includes(dayIndex)) {
      setAvailableDays(availableDays.filter((d) => d !== dayIndex));
    } else {
      setAvailableDays([...availableDays, dayIndex].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: InHouseStaff = {
      id: editingStaff ? editingStaff.id : `staff_${Date.now()}`,
      name: name.trim(),
      avatar: editingStaff?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      role,
      skills,
      phone: phone.trim() || '+65 9000 0000',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      employmentType,
      hourlyRate: Number(hourlyRate),
      weeklyTargetHours: Number(weeklyTargetHours),
      availableDays,
      blackoutDates: editingStaff ? editingStaff.blackoutDates : [],
      notes: notes.trim() || undefined,
    };

    if (editingStaff) {
      onUpdateStaff(payload);
    } else {
      onAddStaff(payload);
    }
    setIsModalOpen(false);
  };

  // Calculate scheduled hours this week for each staff member
  const getScheduledHours = (staffId: string) => {
    return shifts
      .filter((s) => s.assignedStaffId === staffId)
      .reduce((acc, s) => acc + s.hours, 0);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white">
                <Users className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                In-House Manpower & Skill Profiles
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Maintain internal worker records, verified skills, hourly pay rates, and real-time weekly availability. Used by the auto-scheduler to generate balanced, conflict-free shifts.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Staff List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((staff) => {
          const scheduledHours = getScheduledHours(staff.id);
          const hoursUtilization = ((scheduledHours / staff.weeklyTargetHours) * 100).toFixed(0);

          return (
            <div
              key={staff.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-700 bg-slate-200">
                        {staff.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{staff.name}</h3>
                      <div className="text-xs text-slate-600 font-medium">
                        {staff.role} · <span className="text-slate-500 font-normal">{staff.employmentType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(staff)}
                      title="Edit staff profile"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {staffList.length > 1 && (
                      <button
                        onClick={() => onDeleteStaff(staff.id)}
                        title="Delete staff"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  <span className="text-slate-400 font-medium">Skills:</span>
                  {staff.skills.map((s, idx) => (
                    <span key={s} className="text-slate-800 font-medium">
                      {s}{idx < staff.skills.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </div>

                {/* Real-time availability indicator */}
                <div className="mt-3">
                  <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>Weekly Availability:</span>
                    <span className="font-mono">{staff.availableDays.length}/7 days</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map((day, idx) => {
                      const isAvail = staff.availableDays.includes(idx);
                      return (
                        <div
                          key={day}
                          className={`text-[10px] font-mono py-0.5 rounded text-center font-medium ${
                            isAvail
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-3 text-[11px] text-slate-600 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                </div>

                {/* Notes */}
                {staff.notes && (
                  <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{staff.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Metrics: Rate + Target Hours */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Base Wage</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums">
                    ${staff.hourlyRate.toFixed(2)}/hr
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Weekly Scheduled</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums">
                    {scheduledHours}h / {staff.weeklyTargetHours}h{' '}
                    <span className="text-[10px] text-slate-500 font-sans font-normal">
                      ({hoursUtilization}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStaff ? 'Edit Staff Profile' : 'Add New In-House Team Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Tan"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ShiftRole)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Qualified Skills (Used for Auto-Scheduling)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_ROLES.map((s) => {
                    const isChecked = skills.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`text-left px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center justify-between ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{s}</span>
                        {isChecked && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contract type, Hourly rate, Target hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contract Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) =>
                      setEmploymentType(e.target.value as 'Full-Time' | 'Part-Time' | 'In-House Casual')
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-900"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="In-House Casual">In-House Casual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Wage ($/hr)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Hrs / Wk
                  </label>
                  <input
                    type="number"
                    value={weeklyTargetHours}
                    onChange={(e) => setWeeklyTargetHours(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Weekly Availability Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Available Working Days (Click to toggle availability)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day, idx) => {
                    const isSelected = availableDays.includes(idx);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(idx)}
                        className={`py-2 text-xs font-medium rounded text-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+65 9123 4567"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@store.com"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Operational Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Certified on La Marzocco machine, keyholder"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  {editingStaff ? 'Save Profile' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
