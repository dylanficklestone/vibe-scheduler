import React, { useState } from 'react';
import {
  Zap,
  Search,
  Filter,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  Radio,
  Send,
  AlertCircle,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { AdHocWorker, Shift, ShiftRole, AgencyBroadcastRequest } from '../types';

interface AdHocLabourPoolProps {
  adHocWorkers: AdHocWorker[];
  urgentShifts: Shift[];
  broadcasts: AgencyBroadcastRequest[];
  onBookWorkerForShift: (worker: AdHocWorker, shiftId: string) => void;
  onCreateBroadcast: (newBroadcast: AgencyBroadcastRequest) => void;
  preSelectedShift?: Shift | null;
}

export const AdHocLabourPool: React.FC<AdHocLabourPoolProps> = ({
  adHocWorkers,
  urgentShifts,
  broadcasts,
  onBookWorkerForShift,
  onCreateBroadcast,
  preSelectedShift,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>(preSelectedShift?.role || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedWorker, setSelectedWorker] = useState<AdHocWorker | null>(null);
  const [targetShiftId, setTargetShiftId] = useState<string>(preSelectedShift?.id || '');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // New Broadcast Form State
  const [broadcastRole, setBroadcastRole] = useState<ShiftRole>('Barista');
  const [broadcastDate, setBroadcastDate] = useState('2026-10-20');
  const [broadcastTime, setBroadcastTime] = useState('14:00 - 21:30');
  const [broadcastRate, setBroadcastRate] = useState(19);

  // Filter workers
  const filteredWorkers = adHocWorkers.filter((worker) => {
    if (roleFilter !== 'all' && worker.primaryRole !== roleFilter && !worker.skills.includes(roleFilter as ShiftRole)) {
      return false;
    }
    if (availabilityFilter !== 'all' && worker.availability !== availabilityFilter) {
      return false;
    }
    return true;
  });

  const handleOpenBooking = (worker: AdHocWorker) => {
    setSelectedWorker(worker);
    if (preSelectedShift) {
      setTargetShiftId(preSelectedShift.id);
    } else if (urgentShifts.length > 0) {
      setTargetShiftId(urgentShifts[0].id);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedWorker || !targetShiftId) return;

    onBookWorkerForShift(selectedWorker, targetShiftId);
    setBookingSuccessMsg(`Successfully dispatched ${selectedWorker.name} for the shift. Placement fee of $4.50 added to invoice.`);
    setSelectedWorker(null);

    setTimeout(() => {
      setBookingSuccessMsg(null);
    }, 5000);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: AgencyBroadcastRequest = {
      id: `broad_${Date.now()}`,
      role: broadcastRole,
      dateStr: broadcastDate,
      timeSlot: broadcastTime,
      urgency: 'Immediate (Next 2 Hours)',
      hourlyRateOffered: broadcastRate,
      slotsNeeded: 1,
      slotsFilled: 0,
      channelsSyndicated: ['QuickCrew Agency API', 'FastJobs Network', 'GrabJobs SME Portal'],
      createdAt: 'Just now',
      status: 'broadcasting',
    };
    onCreateBroadcast(newReq);
    setShowBroadcastModal(false);
  };

  const chosenShift = urgentShifts.find((s) => s.id === targetShiftId);

  return (
    <div className="space-y-6">
      {/* Banner / Value Proposition */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <Zap className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Ready Pool of Contract Casual Staff
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Instant labor hire for single-store retailers and cafes. Pre-vetted, food-hygiene certified casual workers ready for urgent deployment. Transparent flat $4.50 placement fee per deployed shift.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Shift to Agencies & Portals</span>
            </button>
          </div>
        </div>

        {/* Success toast */}
        {bookingSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bookingSuccessMsg}</span>
          </div>
        )}

        {/* Urgent shortages alert strip if any exist */}
        {urgentShifts.length > 0 && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-xs font-semibold text-rose-900">
                  {urgentShifts.length} urgent shift shortage{urgentShifts.length > 1 ? 's' : ''} require immediate cover:
                </span>
              </div>
              <span className="text-[11px] text-rose-700 font-medium">Click any worker below to dispatch</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {urgentShifts.map((s) => (
                <div
                  key={s.id}
                  className="text-[11px] bg-white border border-rose-200 rounded px-2.5 py-1 text-rose-800 font-medium flex items-center gap-2"
                >
                  <span>{s.dateStr} ({['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][s.dayIndex]})</span>
                  <span>·</span>
                  <span>{s.role}</span>
                  <span>·</span>
                  <span className="font-mono">{s.startTime}-{s.endTime} ({s.hours}h)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Agency Syndication Broadcasts */}
      {broadcasts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Agency & Job Portal Syndication
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              Synced with FastJobs, GrabJobs, and QuickCrew
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{b.role} Cover Needed</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-medium">
                    {b.status === 'broadcasting' ? 'Broadcasting to 3 Networks' : b.status}
                  </span>
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  {b.dateStr} · {b.timeSlot} · Offered: ${b.hourlyRateOffered}/hr
                </div>
                <div className="text-[11px] text-slate-500">
                  Networks: {b.channelsSyndicated.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Skill / Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
            >
              <option value="all">All Skills</option>
              <option value="Barista">Barista</option>
              <option value="Cashier">Cashier</option>
              <option value="Kitchen / Cook">Kitchen / Cook</option>
              <option value="Floor Lead">Floor Lead</option>
              <option value="Retail Associate">Retail Associate</option>
              <option value="Inventory / Stock">Inventory / Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span className="font-medium">Availability:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
            >
              <option value="all">All Timings</option>
              <option value="Available Immediately">Available Immediately</option>
              <option value="Available Tomorrow">Available Tomorrow</option>
              <option value="Available Weekends">Available Weekends</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredWorkers.length} verified casuals
        </div>
      </div>

      {/* Workers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              {/* Profile Header */}
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-200">
                    {worker.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {worker.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{worker.rating}</span>
                      <span className="text-slate-400 font-normal">({worker.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {worker.headline}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="text-slate-700 font-medium">{worker.verifiedAgency}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {worker.distanceKm} km away
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {worker.bio}
              </p>

              {/* Skills unboxed tags */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                <span className="text-slate-400">Skills:</span>
                {worker.skills.map((skill, idx) => (
                  <span key={skill} className="font-medium text-slate-800">
                    {skill}{idx < worker.skills.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Rate, Placement Fee, CTA */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                  ${worker.hourlyRate.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500 font-sans">/hr</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  + $4.50 placement fee
                </div>
              </div>

              <button
                onClick={() => handleOpenBooking(worker)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Book for Shift</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Confirmation Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Dispatch Contract Worker to Store
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant labor hire · Verified under QuickCrew & Partner Agreement
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                {selectedWorker.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{selectedWorker.name}</div>
                <div className="text-[11px] text-slate-600">
                  {selectedWorker.primaryRole} · {selectedWorker.rating}★ · {selectedWorker.completedShiftsCount} shifts completed
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Urgent / Open Shift:
                </label>
                {urgentShifts.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    No urgent shifts currently flagged on roster. You can assign this worker to an open slot from the Weekly Roster view.
                  </p>
                ) : (
                  <select
                    value={targetShiftId}
                    onChange={(e) => setTargetShiftId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  >
                    {urgentShifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.dateStr} · {s.role} ({s.startTime}-{s.endTime}, {s.hours}h)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {chosenShift && (
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Shift Duration:</span>
                    <span>{chosenShift.hours} hours</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Labor Cost ({chosenShift.hours}h × ${selectedWorker.hourlyRate}):</span>
                    <span>${(chosenShift.hours * selectedWorker.hourlyRate).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Placement Fee:</span>
                    <span>$4.50</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Estimated Cost:</span>
                    <span>${(chosenShift.hours * selectedWorker.hourlyRate + 4.5).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!targetShiftId}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm & Dispatch Cover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Broadcast Shift to Job Portals & Agencies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Syndicates instantly across FastJobs, GrabJobs, and QuickCrew partner network.
            </p>

            <form onSubmit={handleBroadcastSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Role
                </label>
                <select
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value as ShiftRole)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                >
                  <option value="Barista">Barista</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Kitchen / Cook">Kitchen / Cook</option>
                  <option value="Floor Lead">Floor Lead</option>
                  <option value="Retail Associate">Retail Associate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={broadcastDate}
                    onChange={(e) => setBroadcastDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Rate ($/hr)</label>
                  <input
                    type="number"
                    value={broadcastRate}
                    onChange={(e) => setBroadcastRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Slot Window
                </label>
                <input
                  type="text"
                  value={broadcastTime}
                  onChange={(e) => setBroadcastTime(e.target.value)}
                  placeholder="e.g. 14:00 - 21:30"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Syndication Channels:</div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FastJobs Employer API (Instant Alert)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GrabJobs SME Gig Network</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>QuickCrew Agency Pool (Direct Dispatch)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Post Urgent Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
