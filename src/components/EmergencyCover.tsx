import React, { useState } from 'react';
import {
  Zap,
  Radio,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  Shift,
  AgencyBroadcastRequest,
  ShiftRole,
  AdHocWorker,
  StoreProfile,
} from '../types';
import { calculateManpowerShortage, getConfirmedAssignedCount } from '../utils/storage';

interface EmergencyCoverProps {
  shifts: Shift[];
  broadcasts: AgencyBroadcastRequest[];
  adHocWorkers: AdHocWorker[];
  activeStore: StoreProfile;
  onBroadcastCover: (request: AgencyBroadcastRequest) => void;
  onDeployAdHocWorker: (shiftId: string, workerId: string) => void;
  onShiftClick: (shift: Shift) => void;
}

export const EmergencyCover: React.FC<EmergencyCoverProps> = ({
  shifts,
  broadcasts,
  adHocWorkers,
  activeStore,
  onBroadcastCover,
  onDeployAdHocWorker,
  onShiftClick,
}) => {
  // Shortage shifts requiring cover
  const shortageShifts = shifts.filter(
    (s) => calculateManpowerShortage(s) > 0 || s.status === 'urgent_needed'
  );

  // Broadcast creation form state
  const [selectedShiftId, setSelectedShiftId] = useState<string>(
    shortageShifts[0]?.id || ''
  );
  const [urgency, setUrgency] = useState<'Immediate (Next 2 Hours)' | 'Today' | 'Tomorrow'>(
    'Immediate (Next 2 Hours)'
  );
  const [hourlyRateOffered, setHourlyRateOffered] = useState<number>(20);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'QuickCrew Agency API',
    'FastJobs Network',
    'GrabJobs SME Portal',
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Filter channels
  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetShift = shifts.find((s) => s.id === selectedShiftId);
    if (!targetShift) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      const newBroadcast: AgencyBroadcastRequest = {
        id: `broad_${Date.now()}`,
        role: targetShift.role,
        dateStr: targetShift.dateStr,
        timeSlot: `${targetShift.startTime} - ${targetShift.endTime}`,
        urgency,
        hourlyRateOffered,
        slotsNeeded: calculateManpowerShortage(targetShift) || 1,
        slotsFilled: 0,
        channelsSyndicated: selectedChannels,
        createdAt: 'Just now',
        status: 'broadcasting',
      };
      onBroadcastCover(newBroadcast);
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-rose-900/40 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Emergency Staff Dispatch & Syndication Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Rapid Manpower Cover for Last-Minute Absences
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              When internal staff report sick or walk out, broadcast unfilled shifts across QuickCrew, FastJobs, and GrabJobs casual agency pools for sub-90-minute arrivals. Flat $4.50 placement fee per deployed shift.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-2xl font-bold font-mono text-amber-300">
                {shortageShifts.length}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Unfilled Gaps</p>
            </div>
          </div>
        </div>
      </div>

      {broadcastSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <strong>Cover Request Broadcasted!</strong> Syndicated to 3 hospitality networks. Candidate responses stream directly into the live dispatch panel below.
            </div>
          </div>
        </div>
      )}

      {/* Grid: Unfilled Shifts vs Fast Broadcast Station */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Unfilled Shifts (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Current Shifts Facing Shortages ({shortageShifts.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any shift to view details or deploy an on-demand contract worker immediately.
                </p>
              </div>
            </div>

            {shortageShifts.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-850/50">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Zero Outstanding Staffing Shortages
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Every scheduled shift for {activeStore.name} currently meets full headcount capacity.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shortageShifts.map((shift) => {
                  const shortage = calculateManpowerShortage(shift);
                  const matchingWorkers = adHocWorkers.filter(
                    (w) => w.primaryRole === shift.role || w.skills.includes(shift.role)
                  );

                  return (
                    <div
                      key={shift.id}
                      className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {shift.taskName || shift.role}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-600 text-white rounded-full">
                              Shortage: {shortage} worker{shortage > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {shift.dateStr} · {shift.startTime} - {shift.endTime} ({shift.hours}h)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onShiftClick(shift)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Shift Details
                          </button>
                        </div>
                      </div>

                      {/* Ready-to-deploy Casual Candidates */}
                      <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                          Instant Dispatch Candidates within 4.5km:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {matchingWorkers.slice(0, 2).map((worker) => (
                            <div
                              key={worker.id}
                              className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={worker.avatar}
                                  alt={worker.name}
                                  className="w-7 h-7 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {worker.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    ★ {worker.rating} · ${worker.hourlyRate}/h + $4.50 fee
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => onDeployAdHocWorker(shift.id, worker.id)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer shrink-0"
                              >
                                Deploy
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Broadcast Syndication Stream */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-indigo-500" />
              Active Cover Broadcasts ({broadcasts.length})
            </h3>

            <div className="space-y-2.5">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {b.role} Cover Request
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {b.dateStr} ({b.timeSlot}) · Offered: ${b.hourlyRateOffered}/h · {b.urgency}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {b.channelsSyndicated.map((ch) => (
                        <span key={ch} className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {b.createdAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Syndication Broadcast Creator (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              Broadcast Station
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Syndicate an urgent call to partner temp agencies and casual worker job boards.
            </p>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            {/* Shift Selector */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Target Shortage Shift *
              </label>
              {shortageShifts.length === 0 ? (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  No unfilled shifts currently detected.
                </div>
              ) : (
                <select
                  required
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  {shortageShifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.dateStr} · {s.role} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Urgency Level *
              </label>
              <div className="space-y-1.5">
                {(['Immediate (Next 2 Hours)', 'Today', 'Tomorrow'] as const).map((lvl) => (
                  <label
                    key={lvl}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      urgency === lvl
                        ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 font-bold text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === lvl}
                      onChange={() => setUrgency(lvl)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hourly Rate Offered */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Hourly Rate Offered ($/h)
              </label>
              <input
                type="number"
                min={15}
                max={45}
                step={0.5}
                value={hourlyRateOffered}
                onChange={(e) => setHourlyRateOffered(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold font-mono text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Higher hourly rates attract faster dispatch responses during peak breakfast & dinner rush.
              </p>
            </div>

            {/* Distribution Channels */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Syndication Networks
              </label>
              <div className="space-y-1.5">
                {[
                  'QuickCrew Agency API',
                  'FastJobs Network',
                  'GrabJobs SME Portal',
                ].map((ch) => (
                  <label
                    key={ch}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(ch)}
                      onChange={() => toggleChannel(ch)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{ch}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isBroadcasting || shortageShifts.length === 0}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isBroadcasting ? 'Broadcasting to Networks...' : 'Broadcast Cover Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
