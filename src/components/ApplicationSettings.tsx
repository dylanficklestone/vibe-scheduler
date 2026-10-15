import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  AlertTriangle,
  FileJson,
  CheckCircle2,
  Sliders,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { UserPreferences } from '../types';
import { STORAGE_VERSION, exportAllDataAsJSON, parseAndValidateImportJSON } from '../utils/storage';

interface ApplicationSettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  appState: any;
  onImportData: (data: any) => void;
  onResetFactoryData: () => void;
}

export const ApplicationSettings: React.FC<ApplicationSettingsProps> = ({
  preferences,
  onUpdatePreferences,
  appState,
  onImportData,
  onResetFactoryData,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export JSON file download
  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const jsonStr = exportAllDataAsJSON(appState);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-roster-shift-operations-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
      handleProcessImport(text);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = (text: string) => {
    setImportError(null);
    setImportSuccess(false);

    const validation = parseAndValidateImportJSON(text);
    if (!validation.success) {
      setImportError(validation.error || 'Failed to parse backup JSON.');
      return;
    }

    onImportData(validation.data);
    setImportSuccess(true);
    setImportJsonText('');
    setTimeout(() => setImportSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Settings className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Application & System Settings
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage browser demonstration storage, data backup, payroll statutory rules, and theme preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
          <span>Engine Version:</span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-bold">
            {STORAGE_VERSION}
          </span>
        </div>
      </div>

      {/* Mandatory Notice: Browser-Specific Demonstration Storage */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
          <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Notice on Data Persistence & Storage Architecture</span>
        </div>
        <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          This application utilizes <strong>browser localStorage</strong> with versioned keys for high-speed client-side responsiveness. <strong>This is a browser-specific demonstration storage, not a shared multi-tenant database.</strong> Changes made on this computer will persist across reloads and tab closures within this browser, but will not synchronize to other devices without exporting and importing the JSON backup.
        </p>
      </div>

      {/* Section 1: Backup, Export & Restore */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-500" />
            JSON Data Backup & Migration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export all scheduled shifts, staff availability, timesheets, and settings for safekeeping or live demonstrations.
          </p>
        </div>

        {importSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Application dataset restored successfully! All rosters and profiles are now updated.</span>
          </div>
        )}

        {importError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-indigo-500" /> Export Full Backup
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Generates a clean JSON file containing stores, employee profiles, weekly shifts, and timesheets.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-500" /> Import & Restore
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Upload a valid JSON backup file to overwrite current browser state.
              </p>
            </div>
            <label className="w-full py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File to Restore</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Manual Paste JSON area */}
        <details className="text-xs text-slate-600 dark:text-slate-400">
          <summary className="font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white">
            Or paste raw backup JSON code directly
          </summary>
          <div className="pt-2 space-y-2">
            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste raw JSON backup payload here..."
              className="w-full font-mono text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <button
              onClick={() => handleProcessImport(importJsonText)}
              disabled={!importJsonText.trim()}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
            >
              Parse & Restore
            </button>
          </div>
        </details>
      </div>

      {/* Section 2: Statutory Singapore Payroll Calculation Defaults */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Statutory Payroll & Overtime Regulations (Singapore MOM)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Default multipliers used in the Salary & Payroll engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/40">
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Weekly OT Threshold
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={30}
                max={50}
                value={preferences.otThreshold}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, otThreshold: Number(e.target.value) })
                }
                className="w-full font-mono font-bold text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-500 font-mono">hrs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">MOM standard is 44 hrs/week</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/40">
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Employer CPF Contribution
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={25}
                value={preferences.employerCpfRate}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, employerCpfRate: Number(e.target.value) })
                }
                className="w-full font-mono font-bold text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-500 font-mono">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Standard rate for SC/PR &lt;55</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/40">
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Weekend Shift Allowance
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">$</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={preferences.weekendAllowance}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, weekendAllowance: Number(e.target.value) })
                }
                className="w-full font-mono font-bold text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-500 font-mono">/hr</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Saturday and Sunday differential</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/40">
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Public Holiday Multiplier
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1.0}
                max={3.0}
                step={0.1}
                value={preferences.phMultiplier}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, phMultiplier: Number(e.target.value) })
                }
                className="w-full font-mono font-bold text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-500 font-mono">x</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">2.0x required under Employment Act</p>
          </div>
        </div>
      </div>

      {/* Section 3: Reset to Factory Demo State */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-rose-500" />
            Reset to Demo Factory Preset
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Restores the initial sample F&B outlet (Roast & Bloom), standard employees, and demonstration shifts.
          </p>
        </div>

        {showConfirmReset ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 space-y-3">
            <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
              Are you sure? This will wipe any custom shifts and employees created in this browser session.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onResetFactoryData();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Factory Demo Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
