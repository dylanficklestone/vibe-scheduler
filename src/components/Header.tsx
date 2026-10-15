import React from 'react';
import { Calendar, Users, Zap, Clock, DollarSign, BarChart2, MessageSquare, Layers } from 'lucide-react';
import { StoreProfile } from '../types';

export type NavTab = 'roster' | 'adhoc' | 'staff' | 'timesheets' | 'salary' | 'analytics' | 'community';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeStore: StoreProfile;
  stores: StoreProfile[];
  onSelectStore: (store: StoreProfile) => void;
  onOpenUrgentModal: () => void;
  onOpenCanvasModal: () => void;
  urgentShiftsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeStore,
  stores,
  onSelectStore,
  onOpenUrgentModal,
  onOpenCanvasModal,
  urgentShiftsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark + subtle store switcher */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                S
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  ShiftPulse
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-mono">
                  1-Store Ops
                </span>
              </div>
            </div>

            {/* Store preset dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-xs text-slate-400">Outlet:</span>
              <select
                value={activeStore.id}
                onChange={(e) => {
                  const s = stores.find((x) => x.id === e.target.value);
                  if (s) onSelectStore(s);
                }}
                className="text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onTabChange('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'roster'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Roster</span>
              {urgentShiftsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-semibold bg-rose-500 text-white rounded">
                  {urgentShiftsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('adhoc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'adhoc'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Ad-Hoc Pool</span>
            </button>

            <button
              onClick={() => onTabChange('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'staff'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Profiles</span>
            </button>

            <button
              onClick={() => onTabChange('timesheets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'timesheets'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timesheets</span>
            </button>

            <button
              onClick={() => onTabChange('salary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'salary'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Salary Calc</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'analytics'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>

            <button
              onClick={() => onTabChange('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'community'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Canvas Spec toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCanvasModal}
              title="View Business Model Canvas mapping"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>BMC Spec</span>
            </button>

            <button
              onClick={onOpenUrgentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Request Urgent Cover</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation */}
        <div className="md:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-100 text-xs scrollbar-none">
          <button
            onClick={() => onTabChange('roster')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'roster' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Roster {urgentShiftsCount > 0 ? `(${urgentShiftsCount})` : ''}
          </button>
          <button
            onClick={() => onTabChange('adhoc')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'adhoc' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Ad-Hoc Pool
          </button>
          <button
            onClick={() => onTabChange('staff')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'staff' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => onTabChange('timesheets')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'timesheets' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Timesheets
          </button>
          <button
            onClick={() => onTabChange('salary')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'salary' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Salary
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => onTabChange('community')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              currentTab === 'community' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Community
          </button>
          <button
            onClick={onOpenCanvasModal}
            className="px-2.5 py-1 rounded whitespace-nowrap font-medium text-slate-500 hover:text-slate-900"
          >
            BMC Spec
          </button>
        </div>
      </div>
    </header>
  );
};
