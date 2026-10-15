import React, { useState } from 'react';
import { X, Layers, ExternalLink, CheckCircle2 } from 'lucide-react';
import { BMC_CANVAS_MAPPING } from '../data/mockData';
import { NavTab } from '../types';

interface BusinessModelCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFeature: (tab: NavTab) => void;
}

export const BusinessModelCanvasModal: React.FC<BusinessModelCanvasModalProps> = ({
  isOpen,
  onClose,
  onNavigateToFeature,
}) => {
  const [selectedDot, setSelectedDot] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Business Model Canvas (Strategyzer)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  1-Store Manpower Scheduler
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Interactive mapping showing how every sticky note in the user's canvas is operationalized in Weekly Roster & Shift Operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dot voting visual from original canvas */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-full px-2.5">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Dot Voting:</span>
              {['#06b6d4', '#84cc16', '#eab308', '#f43f5e', '#ec4899', '#6366f1'].map((color, idx) => (
                <button
                  key={color}
                  onClick={() => setSelectedDot(selectedDot === idx ? null : idx)}
                  style={{ backgroundColor: color }}
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    selectedDot === idx ? 'scale-125 ring-2 ring-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Visual Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Main 5 columns (Partners, Activities/Resources, Propositions, Customer Rel/Channels, Customer Segments) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Col 1: Key Partners */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2">Key Partners</div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-blue-100 border border-blue-200 text-xs text-blue-900 font-medium shadow-xs">
                    One-outlet only retail operators
                  </div>
                  <div className="p-2.5 rounded bg-blue-100 border border-blue-200 text-xs text-blue-900 font-medium shadow-xs">
                    Job portals (FastJobs, GrabJobs)
                  </div>
                  <div className="p-2.5 rounded bg-blue-100 border border-blue-200 text-xs text-blue-900 font-medium shadow-xs">
                    Manpower agencies
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFeature('adhoc');
                }}
                className="mt-3 text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>View Partner Hub</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Col 2: Key Activities & Key Resources */}
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-2">Key Activities</div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    Labour Hire
                  </div>
                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    Timesheet Management
                  </div>
                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    in-house manpower skill / profile keeping
                  </div>
                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    Schedule Internal Manpower for store operation
                  </div>
                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    Salary Calculation
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-2">Key Resources</div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-blue-100 border border-blue-200 text-xs text-blue-900 font-medium shadow-xs">
                    External casual worker access
                  </div>
                  <div className="p-2 rounded bg-blue-100 border border-blue-200 text-xs text-blue-900 font-medium shadow-xs">
                    in-house workers with detailed/real-time availability
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3: Key Propositions */}
            <div className="bg-white p-3 rounded-xl border-2 border-amber-300 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-amber-900 mb-2 flex items-center justify-between">
                  <span>Key Propositions</span>
                  <span className="text-[10px] text-amber-700 font-mono">Core Value</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded bg-amber-100 border border-amber-300 text-xs text-amber-900 font-medium shadow-xs">
                    Automatic scheduling of staff shift/roster
                  </div>
                  <div className="p-3 rounded bg-amber-100 border border-amber-300 text-xs text-amber-900 font-medium shadow-xs">
                    Customer can tap on a ready pool of contract staff to fill in any shortage of staff
                  </div>
                  <div className="p-3 rounded bg-amber-100 border border-amber-300 text-xs text-amber-900 font-medium shadow-xs">
                    Ability to tweak the auto-generated roster where required
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFeature('roster');
                }}
                className="mt-3 text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                <span>Try Auto-Scheduler Now</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Col 4: Customer Relationships & Channels */}
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-2">Customer Relationships</div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-orange-100 border border-orange-200 text-xs text-orange-900 font-medium shadow-xs">
                    can contact us via email
                  </div>
                  <div className="p-2 rounded bg-orange-100 border border-orange-200 text-xs text-orange-900 font-medium shadow-xs">
                    C2C support in forums
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-2">Channels</div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-orange-100 border border-orange-200 text-xs text-orange-900 font-medium shadow-xs">
                    email notifications
                  </div>
                  <div className="p-2 rounded bg-orange-100 border border-orange-200 text-xs text-orange-900 font-medium shadow-xs">
                    mobile-friendly website
                  </div>
                  <div className="p-2 rounded bg-yellow-100 border border-yellow-200 text-xs text-yellow-900 font-medium shadow-xs">
                    Web application
                  </div>
                  <div className="p-2 rounded bg-yellow-100 border border-yellow-200 text-xs text-yellow-900 font-medium shadow-xs">
                    online advertising
                  </div>
                </div>
              </div>
            </div>

            {/* Col 5: Customer Segments */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2">Customer Segments</div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    Restaurants & Shops
                  </div>
                  <div className="p-2.5 rounded bg-rose-100 border border-rose-200 text-xs text-rose-900 font-medium shadow-xs">
                    SMEs with manpower scheduling needs
                  </div>
                  <div className="p-2.5 rounded bg-yellow-100 border border-yellow-200 text-xs text-yellow-900 font-medium shadow-xs">
                    1-Store Retail & F&B Operators
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFeature('staff');
                }}
                className="mt-3 text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                <span>View Store Profiles</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom 2 rows: Cost Structure & Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Cost Structure */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-900 mb-2">Cost Structure</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium shadow-xs">
                  Cost of hosting webpage and database
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium shadow-xs">
                  Data acquisition cost for manpower database
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium shadow-xs">
                  API Access for data pull link to external talent management tools
                </div>
              </div>
            </div>

            {/* Revenue Streams */}
            <div className="bg-white p-4 rounded-xl border border-emerald-300">
              <div className="text-xs font-bold text-emerald-900 mb-2">Revenue Streams</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-bold shadow-xs">
                  Placement fee per temp labour deployed ($4.50)
                </div>
                <div className="p-2 rounded bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-bold shadow-xs">
                  SaaS subscription fee to access scheduler ($29 - $59/mo)
                </div>
                <div className="p-2 rounded bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-bold shadow-xs">
                  Insights and analytics as an add-on for incremental rev ($19/mo)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Source: Strategyzer AG | Canvas faithfully converted into production-ready software
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Back to Application
          </button>
        </div>
      </div>
    </div>
  );
};
