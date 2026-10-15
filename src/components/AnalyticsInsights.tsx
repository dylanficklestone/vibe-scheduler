import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Shift, InHouseStaff, AdHocWorker, StoreProfile } from '../types';

interface AnalyticsInsightsProps {
  shifts: Shift[];
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  activeStore: StoreProfile;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({
  shifts,
  inHouseStaff,
  adHocWorkers,
  activeStore,
}) => {
  const [activePlan, setActivePlan] = useState<'pro' | 'starter'>('pro');
  const [hasInsightsAddon, setHasInsightsAddon] = useState(true);

  // Calculations
  const inHouseHours = shifts
    .filter((s) => !s.isAdHoc && s.assignedStaffId)
    .reduce((acc, s) => acc + s.hours, 0);

  const adHocHours = shifts
    .filter((s) => s.isAdHoc && s.assignedAdHocId)
    .reduce((acc, s) => acc + s.hours, 0);

  const inHouseSpend = shifts
    .filter((s) => !s.isAdHoc && s.assignedStaffId)
    .reduce((acc, s) => acc + s.hours * s.hourlyRate, 0);

  const adHocSpend = shifts
    .filter((s) => s.isAdHoc && s.assignedAdHocId)
    .reduce((acc, s) => acc + s.hours * s.hourlyRate + 4.5, 0);

  const totalLaborCost = inHouseSpend + adHocSpend;
  const weeklyRevenueTarget = activeStore.dailyRevenueTarget * 7;
  const laborPercentage = ((totalLaborCost / weeklyRevenueTarget) * 100).toFixed(1);

  // Hourly coverage curve across typical business day (8:00 - 22:00)
  const hourlyCurve = [
    { hour: '08:00', traffic: 'High (Rush)', staff: 2, demandScore: 85 },
    { hour: '09:00', traffic: 'Peak', staff: 2, demandScore: 95 },
    { hour: '10:00', traffic: 'Moderate', staff: 2, demandScore: 60 },
    { hour: '11:00', traffic: 'Moderate', staff: 3, demandScore: 65 },
    { hour: '12:00', traffic: 'Peak (Lunch)', staff: 3, demandScore: 92 },
    { hour: '13:00', traffic: 'High', staff: 3, demandScore: 88 },
    { hour: '14:00', traffic: 'Low', staff: 2, demandScore: 40 },
    { hour: '15:00', traffic: 'Moderate', staff: 2, demandScore: 50 },
    { hour: '16:00', traffic: 'Moderate', staff: 2, demandScore: 55 },
    { hour: '17:00', traffic: 'High', staff: 2, demandScore: 78 },
    { hour: '18:00', traffic: 'Peak (Dinner)', staff: 3, demandScore: 90 },
    { hour: '19:00', traffic: 'High', staff: 2, demandScore: 75 },
    { hour: '20:00', traffic: 'Moderate', staff: 2, demandScore: 45 },
    { hour: '21:00', traffic: 'Closing', staff: 2, demandScore: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white">
                <BarChart2 className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Insights & Labor Efficiency Add-On
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Real-time manpower cost analytics, labor-to-sales ratios, and rush-hour staffing optimization for single-outlet retail & restaurant operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Subscription Status:
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">
              Active Store Pro ($59/mo)
            </span>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Weekly Revenue Target</span>
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              ${weeklyRevenueTarget.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Total Labor Spend</span>
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              ${totalLaborCost.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Labor Cost / Sales %</span>
            <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
              {laborPercentage}%
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">
              (Benchmark: &lt;24%)
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Ad-Hoc Flexibility Ratio</span>
            <span className="text-base font-bold text-amber-700 font-mono tabular-nums">
              {((adHocHours / (inHouseHours + adHocHours || 1)) * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">
              Variable casual labor
            </span>
          </div>
        </div>
      </div>

      {/* Labor Composition & Foot Traffic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Fixed vs Variable Manpower Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Manpower Cost Breakdown: Fixed vs On-Demand
            </h2>
            <span className="text-xs text-slate-500 font-mono">Week 43</span>
          </div>

          <div className="space-y-3">
            {/* In House Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-800">
                  In-House Core Team ({inHouseHours.toFixed(1)} hrs)
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  ${inHouseSpend.toFixed(2)}{' '}
                  <span className="text-slate-400 text-[11px] font-normal font-sans">
                    ({((inHouseSpend / totalLaborCost) * 100).toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-2.5 rounded-full"
                  style={{ width: `${(inHouseSpend / totalLaborCost) * 100}%` }}
                />
              </div>
            </div>

            {/* Ad-Hoc Casual Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-amber-900">
                  On-Demand Casual Pool ({adHocHours.toFixed(1)} hrs)
                </span>
                <span className="font-mono font-bold text-amber-800 tabular-nums">
                  ${adHocSpend.toFixed(2)}{' '}
                  <span className="text-slate-400 text-[11px] font-normal font-sans">
                    ({((adHocSpend / totalLaborCost) * 100).toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${(adHocSpend / totalLaborCost) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Single-Store Economics Insight:</strong> Using a ready pool of contract casuals for weekend rushes and sick covers saves an estimated <strong>$720/month</strong> compared to maintaining an extra full-time idle employee on fixed payroll.
          </div>
        </div>

        {/* Card 2: Peak Store Foot Traffic vs Floor Staffing */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Store Traffic Demand vs Staff On Floor
            </h2>
            <span className="text-xs text-slate-500 font-mono">Daily Curve</span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {hourlyCurve.slice(0, 8).map((slot) => (
              <div
                key={slot.hour}
                className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-50 font-mono"
              >
                <span className="text-slate-700 w-16">{slot.hour}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-2 rounded-full ${
                        slot.demandScore > 80
                          ? 'bg-rose-500'
                          : slot.demandScore > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${slot.demandScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-right w-24">
                  <span className="text-slate-900 font-semibold">{slot.staff} staff</span>
                  <span className="text-[10px] text-slate-400 font-sans block">
                    {slot.traffic}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500">
            Demand score calculated from POS receipt timestamps and door footfall sensor.
          </p>
        </div>
      </div>

      {/* SaaS Subscription Architecture (Canvas Revenue Streams) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            SaaS Subscription & Pricing Architecture (Business Model Canvas)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare recurring subscription costs and platform transaction fees for single-store retail & SME operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-900">1-Store Starter</div>
              <div className="text-xs text-slate-500">For boutique kiosks & small shops</div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              $29<span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Up to 10 in-house staff profiles</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Manual roster drag & drop</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Timesheet clock-in/out</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span>$4.50 fee per casual worker deployed</span>
              </li>
            </ul>
            <button
              onClick={() => setActivePlan('starter')}
              className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                activePlan === 'starter'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {activePlan === 'starter' ? 'Current Plan' : 'Downgrade to Starter'}
            </button>
          </div>

          {/* Plan 2: Active Pro */}
          <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-50/50 space-y-3 relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Recommended
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Single-Store Pro</div>
              <div className="text-xs text-slate-500">For busy cafés, bakeries & apparel</div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              $59<span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited in-house staff & skills</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>1-Click Auto-Roster Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Direct Ready Pool instant dispatch</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Agency & Job Portal API syndication</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Overtime & Salary payroll export</span>
              </li>
            </ul>
            <button
              onClick={() => setActivePlan('pro')}
              className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                activePlan === 'pro'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {activePlan === 'pro' ? 'Active Subscription' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Plan 3: Insights & Analytics Add-on */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Insights & Analytics Add-On</div>
              <div className="text-xs text-slate-500">Incremental revenue module (BMC)</div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              +$19<span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Labor cost vs POS sales ratio</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Peak rush hourly staffing heatmap</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Overtime leakage audit</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CSV financial reporting</span>
              </li>
            </ul>
            <button
              onClick={() => setHasInsightsAddon(!hasInsightsAddon)}
              className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                hasInsightsAddon
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {hasInsightsAddon ? 'Add-On Enabled' : 'Add to Plan (+$19/mo)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
