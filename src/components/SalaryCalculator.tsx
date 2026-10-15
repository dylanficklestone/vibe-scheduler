import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  Sliders,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { InHouseStaff, AdHocWorker, Shift, TimesheetEntry, StoreProfile, PublicHoliday } from '../types';

interface SalaryCalculatorProps {
  inHouseStaff: InHouseStaff[];
  adHocWorkers: AdHocWorker[];
  shifts: Shift[];
  timesheets: TimesheetEntry[];
  activeStore: StoreProfile;
  holidays: PublicHoliday[];
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  inHouseStaff,
  adHocWorkers,
  shifts,
  timesheets,
  activeStore,
  holidays,
}) => {
  const [otThreshold, setOtThreshold] = useState<number>(44);
  const [employerTaxRate, setEmployerTaxRate] = useState<number>(17); // 17% employer CPF/tax
  const [weekendAllowancePerHour, setWeekendAllowancePerHour] = useState<number>(2.0);
  const [phMultiplier, setPhMultiplier] = useState<number>(2.0); // 2.0x for public holiday pay
  const [exportedNotice, setExportedNotice] = useState(false);

  const isPublicHolidayDate = (dateStr: string) => {
    return holidays.some((h) => h.date === dateStr);
  };

  // Compute breakdown for in-house staff
  const staffBreakdowns = inHouseStaff.map((staff) => {
    const staffShifts = shifts.filter((s) => s.assignedStaffId === staff.id);
    const scheduledHours = staffShifts.reduce((acc, s) => acc + s.hours, 0);

    // Compute weekend hours (Saturday=5, Sunday=6)
    const weekendHours = staffShifts
      .filter((s) => s.dayIndex === 5 || s.dayIndex === 6)
      .reduce((acc, s) => acc + s.hours, 0);

    // Compute Public Holiday hours
    const publicHolidayHours = staffShifts
      .filter((s) => isPublicHolidayDate(s.dateStr))
      .reduce((acc, s) => acc + s.hours, 0);

    // Actual timesheet hours if approved
    const staffTs = timesheets.filter((t) => t.staffName.toLowerCase().includes(staff.name.toLowerCase()));
    const timesheetHours = staffTs.length > 0
      ? staffTs.reduce((acc, t) => acc + t.totalHours, 0)
      : scheduledHours;

    const effectiveHours = timesheetHours > 0 ? timesheetHours : scheduledHours;
    const regularHours = Math.min(effectiveHours, otThreshold);
    const otHours = Math.max(0, effectiveHours - otThreshold);

    const regularPay = regularHours * staff.hourlyRate;
    const otPay = otHours * (staff.hourlyRate * 1.5);
    const weekendAllowance = weekendHours * weekendAllowancePerHour;

    // Public holiday extra pay (multiplier - 1) * hourlyRate * PH hours
    const phExtraPay = publicHolidayHours * (staff.hourlyRate * (phMultiplier - 1));
    const grossPay = regularPay + otPay + weekendAllowance + phExtraPay;

    // Employer taxes / CPF (full-time gets statutory 17%, part-time gets 7.5%)
    const taxRate = staff.employmentType === 'Full-Time' ? (employerTaxRate / 100) : 0.08;
    const employerCost = grossPay * taxRate;
    const totalCostToStore = grossPay + employerCost;

    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      type: staff.employmentType,
      isAdHoc: false,
      hourlyRate: staff.hourlyRate,
      scheduledHours,
      actualHours: effectiveHours,
      regularPay,
      otHours,
      otPay,
      weekendAllowance,
      phHours: publicHolidayHours,
      phExtraPay,
      grossPay,
      employerCost,
      totalCostToStore,
      placementFee: 0,
    };
  });

  // Compute ad-hoc casual shifts deployed
  const adHocShifts = shifts.filter((s) => s.isAdHoc && s.assignedAdHocId);
  const adHocWorkersGrouped = adHocWorkers.filter((w) =>
    adHocShifts.some((s) => s.assignedAdHocId === w.id)
  );

  const adHocBreakdowns = adHocWorkersGrouped.map((worker) => {
    const workerShifts = adHocShifts.filter((s) => s.assignedAdHocId === worker.id);
    const totalHours = workerShifts.reduce((acc, s) => acc + s.hours, 0);
    const placementFeeTotal = workerShifts.length * 4.5; // $4.50 per shift placement fee

    // Check if worker worked on Public Holiday
    const phHours = workerShifts
      .filter((s) => isPublicHolidayDate(s.dateStr))
      .reduce((acc, s) => acc + s.hours, 0);
    const phExtra = phHours * (worker.hourlyRate * (phMultiplier - 1));

    const grossWage = totalHours * worker.hourlyRate + phExtra;
    const totalCostToStore = grossWage + placementFeeTotal;

    return {
      id: worker.id,
      name: `${worker.name} (Ad-Hoc)`,
      role: worker.primaryRole,
      type: 'Contract Casual',
      isAdHoc: true,
      hourlyRate: worker.hourlyRate,
      scheduledHours: totalHours,
      actualHours: totalHours,
      regularPay: totalHours * worker.hourlyRate,
      otHours: 0,
      otPay: 0,
      weekendAllowance: 0,
      phHours,
      phExtraPay: phExtra,
      grossPay: grossWage,
      employerCost: 0, // contract workers handled via agency
      placementFee: placementFeeTotal,
      totalCostToStore,
    };
  });

  const allBreakdowns = [...staffBreakdowns, ...adHocBreakdowns];

  // Totals
  const totalPayrollGross = allBreakdowns.reduce((acc, b) => acc + b.grossPay, 0);
  const totalEmployerTaxes = allBreakdowns.reduce((acc, b) => acc + b.employerCost, 0);
  const totalPlacementFees = allBreakdowns.reduce((acc, b) => acc + b.placementFee, 0);
  const totalPhPay = allBreakdowns.reduce((acc, b) => acc + b.phExtraPay, 0);
  const grandTotalCost = allBreakdowns.reduce((acc, b) => acc + b.totalCostToStore, 0);
  const totalLaborHours = allBreakdowns.reduce((acc, b) => acc + b.actualHours, 0);

  // Revenue vs Labor cost
  const projectedWeeklyRevenue = activeStore.dailyRevenueTarget * 7;
  const laborPercentageOfSales = ((grandTotalCost / projectedWeeklyRevenue) * 100).toFixed(1);

  const handleExportCSV = () => {
    const headers = [
      'Worker Name',
      'Role',
      'Employment Type',
      'Base Rate ($/hr)',
      'Total Hours',
      'Regular Pay ($)',
      'OT Hours',
      'OT Pay ($)',
      'Weekend Extra ($)',
      'Public Holiday Pay ($)',
      'Placement Fee ($)',
      'Gross Pay ($)',
      'Employer CPF/Tax ($)',
      'Total Store Cost ($)',
    ];

    const rows = allBreakdowns.map((b) => [
      `"${b.name}"`,
      `"${b.role}"`,
      `"${b.type}"`,
      b.hourlyRate.toFixed(2),
      b.actualHours.toFixed(2),
      b.regularPay.toFixed(2),
      b.otHours.toFixed(2),
      b.otPay.toFixed(2),
      b.weekendAllowance.toFixed(2),
      b.phExtraPay.toFixed(2),
      b.placementFee.toFixed(2),
      b.grossPay.toFixed(2),
      b.employerCost.toFixed(2),
      b.totalCostToStore.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payroll_summary_${activeStore.name.replace(/\s+/g, '_')}_week.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <DollarSign className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Salary & Payroll Calculation
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Automated wage engine factoring in regular hours, 1.5x overtime, weekend allowances, <strong>Nager.Date Public Holiday rates ({phMultiplier}×)</strong>, statutory employer contributions, and ad-hoc casual placement fees ($4.50/shift).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payroll CSV</span>
            </button>
          </div>
        </div>

        {/* Export toast */}
        {exportedNotice && (
          <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Payroll CSV downloaded. Includes gazetted Public Holiday wage provisions.</span>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Total Store Labor Cost</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              ${grandTotalCost.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Gross Wages to Staff</span>
            <span className="text-lg font-bold text-slate-800 font-mono tabular-nums">
              ${totalPayrollGross.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Public Holiday Premium</span>
            <span className="text-lg font-bold text-amber-700 font-mono tabular-nums">
              ${totalPhPay.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">({phMultiplier}× rate for gazetted PH)</span>
          </div>

          <div>
            <span className="text-slate-500 block">Labor Cost / Sales %</span>
            <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
              {laborPercentageOfSales}%
            </span>
            <span className="text-[10px] text-slate-400">
              (Target: 18-25% for F&B)
            </span>
          </div>
        </div>
      </div>

      {/* Wage Rules Configuration Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Store Wage Calculation Rules & Overtime Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">
              Overtime Threshold (Hrs/Wk): <strong className="text-slate-900 font-mono">{otThreshold}h</strong>
            </label>
            <input
              type="range"
              min="38"
              max="48"
              step="1"
              value={otThreshold}
              onChange={(e) => setOtThreshold(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-slate-900"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Exceeding hours computed at 1.5× base wage
            </span>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">
              Public Holiday Pay Multiplier: <strong className="text-amber-800 font-mono">{phMultiplier}×</strong>
            </label>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.5"
              value={phMultiplier}
              onChange={(e) => setPhMultiplier(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-amber-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Statutory 2.0x double wage on gazetted public holidays
            </span>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">
              Weekend Shift Extra ($/hr): <strong className="text-slate-900 font-mono">+${weekendAllowancePerHour.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={weekendAllowancePerHour}
              onChange={(e) => setWeekendAllowancePerHour(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-slate-900"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Applied automatically to Saturday & Sunday
            </span>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">
              Employer CPF / Tax: <strong className="text-slate-900 font-mono">{employerTaxRate}%</strong>
            </label>
            <input
              type="range"
              min="10"
              max="20"
              step="0.5"
              value={employerTaxRate}
              onChange={(e) => setEmployerTaxRate(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-slate-900"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Statutory pension & insurance provision
            </span>
          </div>
        </div>
      </div>

      {/* Salary Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Employee Payroll Ledger (Accounting for Public Holidays)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {allBreakdowns.length} workers · {totalLaborHours.toFixed(1)} total hours
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Worker & Type</th>
                <th className="py-3 px-4 text-right">Base Wage</th>
                <th className="py-3 px-4 text-right">Hours</th>
                <th className="py-3 px-4 text-right">Regular Pay</th>
                <th className="py-3 px-4 text-right">OT Pay (1.5x)</th>
                <th className="py-3 px-4 text-right">PH Extra ({phMultiplier}x)</th>
                <th className="py-3 px-4 text-right">Weekend Extra</th>
                <th className="py-3 px-4 text-right">Placement Fee</th>
                <th className="py-3 px-4 text-right">Gross Pay</th>
                <th className="py-3 px-4 text-right">Employer Taxes</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Total Store Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBreakdowns.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Worker & Type */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {b.role} · <span className="font-medium text-slate-700">{b.type}</span>
                    </div>
                  </td>

                  {/* Base Wage */}
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    ${b.hourlyRate.toFixed(2)}/h
                  </td>

                  {/* Hours */}
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                    {b.actualHours.toFixed(1)}h
                  </td>

                  {/* Regular Pay */}
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    ${b.regularPay.toFixed(2)}
                  </td>

                  {/* OT Pay */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {b.otHours > 0 ? (
                      <span className="text-amber-700 font-semibold">
                        ${b.otPay.toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({b.otHours.toFixed(1)}h)
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Public Holiday Extra Pay */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {b.phExtraPay > 0 ? (
                      <span className="text-amber-800 font-semibold">
                        +${b.phExtraPay.toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({b.phHours}h PH)
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Weekend Allowance */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {b.weekendAllowance > 0 ? (
                      <span className="text-slate-700 font-medium">
                        +${b.weekendAllowance.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Placement Fee */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {b.placementFee > 0 ? (
                      <span className="text-amber-800 font-semibold">
                        ${b.placementFee.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Gross Pay */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${b.grossPay.toFixed(2)}
                  </td>

                  {/* Employer Taxes */}
                  <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                    {b.employerCost > 0 ? `$${b.employerCost.toFixed(2)}` : '—'}
                  </td>

                  {/* Total Store Cost */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${b.totalCostToStore.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono font-bold text-slate-900">
              <tr>
                <td className="py-3 px-4">Weekly Store Totals</td>
                <td className="py-3 px-4 text-right">—</td>
                <td className="py-3 px-4 text-right tabular-nums">{totalLaborHours.toFixed(1)}h</td>
                <td className="py-3 px-4 text-right tabular-nums">
                  ${allBreakdowns.reduce((acc, b) => acc + b.regularPay, 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-amber-700">
                  ${allBreakdowns.reduce((acc, b) => acc + b.otPay, 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-amber-800">
                  ${totalPhPay.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  ${allBreakdowns.reduce((acc, b) => acc + b.weekendAllowance, 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-amber-800">
                  ${totalPlacementFees.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">${totalPayrollGross.toFixed(2)}</td>
                <td className="py-3 px-4 text-right tabular-nums">${totalEmployerTaxes.toFixed(2)}</td>
                <td className="py-3 px-4 text-right tabular-nums text-sm font-black">
                  ${grandTotalCost.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
