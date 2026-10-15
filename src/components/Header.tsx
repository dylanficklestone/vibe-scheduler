import React, { useState } from 'react';
import {
  Calendar,
  Zap,
  Users,
  Clock,
  DollarSign,
  BarChart2,
  MessageSquare,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { StoreProfile } from '../types';

export type NavTab = 'roster' | 'adhoc' | 'staff' | 'timesheets' | 'salary' | 'analytics' | 'community';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeStore: StoreProfile;
  stores: StoreProfile[];
  onSelectStore: (store: StoreProfile) => void;
  onOpenUrgentModal: () => void;
  onOpenCanvasModal?: () => void;
  onOpenStoreSettings?: () => void;
  urgentShiftsCount: number;
}

interface NavItem {
  key: NavTab;
  label: string;
  badge?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeStore,
  stores,
  onSelectStore,
  onOpenUrgentModal,
  onOpenStoreSettings,
  urgentShiftsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { key: 'roster', label: 'Roster', badge: urgentShiftsCount > 0 ? urgentShiftsCount : undefined },
    { key: 'adhoc', label: 'Ad-Hoc Pool' },
    { key: 'staff', label: 'Staff' },
    { key: 'timesheets', label: 'Timesheets' },
    { key: 'salary', label: 'Salary' },
    { key: 'analytics', label: 'Insights' },
    { key: 'community', label: 'Community' },
  ];

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          {/* Zone 1: Brand & Outlet Selection */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => handleTabClick('roster')}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                S
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  ShiftPulse
                </span>
                <span className="hidden xl:inline text-[11px] text-slate-500 font-mono">
                  1-Store
                </span>
              </div>
            </button>

            {/* Subtle Outlet Dropdown & Settings Action */}
            <div className="relative flex items-center pl-2 sm:pl-3 border-l border-slate-200">
              <Store className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0 hidden sm:block" />
              <select
                value={activeStore.id}
                onChange={(e) => {
                  if (e.target.value === '__manage_stores__') {
                    if (onOpenStoreSettings) onOpenStoreSettings();
                  } else {
                    const s = stores.find((x) => x.id === e.target.value);
                    if (s) onSelectStore(s);
                  }
                }}
                className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 max-w-[120px] sm:max-w-[160px] truncate focus:outline-none cursor-pointer"
                title={`Active Store: ${activeStore.name}`}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="__manage_stores__">+ Manage / Add Stores...</option>
              </select>

              {onOpenStoreSettings && (
                <button
                  type="button"
                  onClick={onOpenStoreSettings}
                  title="Manage Franchise Stores & Settings"
                  className="ml-1 p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-slate-500 sm:hidden" />
                  <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-1">
                    ⚙ Settings
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean text tabs) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className={`relative px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-md ${
                    isActive
                      ? 'text-slate-900 font-bold bg-slate-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-600 text-white rounded-full leading-tight font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action (Request Cover CTA) + mobile toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUrgentModal}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Request Cover</span>
              <span className="xs:hidden">Cover</span>
            </button>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Medium Screen Horizontal Navigation Bar */}
        <div className="hidden md:flex lg:hidden items-center gap-1 py-1.5 border-t border-slate-100 overflow-x-auto scrollbar-none text-xs">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium transition-colors ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
                {item.badge !== undefined && ` (${item.badge})`}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Menu when toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {navItems.map((item) => {
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                      {item.badge} Urgent
                    </span>
                  )}
                </button>
              );
            })}
            {onOpenStoreSettings && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onOpenStoreSettings();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 rounded-lg text-left"
                >
                  <Store className="w-4 h-4 text-slate-500" />
                  <span>Franchise Stores & Settings ({stores.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
