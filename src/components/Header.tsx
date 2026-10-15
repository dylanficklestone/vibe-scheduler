import React, { useState } from 'react';
import {
  Menu,
  Zap,
  Bell,
  Sun,
  Moon,
  Store,
  Layers,
  AlertTriangle,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { StoreProfile, Shift, NavTab } from '../types';

interface HeaderProps {
  activeStore: StoreProfile;
  stores: StoreProfile[];
  onSelectStore: (store: StoreProfile) => void;
  urgentShifts: Shift[];
  onOpenUrgentModal: () => void;
  onOpenCanvasModal: () => void;
  onToggleMobileMenu: () => void;
  onNavigateTab: (tab: NavTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeStore,
  stores,
  onSelectStore,
  urgentShifts,
  onOpenUrgentModal,
  onOpenCanvasModal,
  onToggleMobileMenu,
  onNavigateTab,
  theme,
  onToggleTheme,
  sidebarCollapsed,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Left side: Hamburger (mobile) + Breadcrumbs/Store badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open mobile menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* App title on mobile when sidebar is hidden */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              WR
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
              Weekly Roster & Shift Operations
            </span>
          </div>

          {/* Desktop store indicator badge */}
          <div className="hidden lg:flex items-center gap-2 pl-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/80">
              <Store className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-900 dark:text-white">{activeStore.name}</span>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">{activeStore.type}</span>
            </span>
          </div>
        </div>

        {/* Right side: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Business Model Canvas Button */}
          <button
            onClick={onOpenCanvasModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="View 9-Block Business Model Canvas"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>BMC Strategy</span>
          </button>

          {/* Request / Emergency Cover Button */}
          <button
            onClick={onOpenUrgentModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline">Request Cover</span>
            <span className="xs:hidden">Cover</span>
            {urgentShifts.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-white/25 rounded-full text-[10px] font-bold">
                {urgentShifts.length}
              </span>
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Staffing notifications"
            >
              <Bell className="w-4 h-4" />
              {urgentShifts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Staffing Alerts</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {urgentShifts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {urgentShifts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                      No urgent shortages right now! All shifts are currently staffed.
                    </div>
                  ) : (
                    urgentShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-rose-900 dark:text-rose-200 truncate">
                            {shift.taskName || shift.role} · Shortage
                          </p>
                          <p className="text-[11px] text-rose-700 dark:text-rose-300">
                            {shift.dateStr} ({shift.startTime} - {shift.endTime})
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            onNavigateTab('emergency');
                          }}
                          className="shrink-0 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-200 bg-white dark:bg-slate-900 hover:bg-rose-100 border border-rose-300 dark:border-rose-800 rounded-md transition-colors"
                        >
                          Cover
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigateTab('roster');
                    }}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Weekly Roster
                  </button>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigateTab('emergency');
                    }}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Emergency Dispatch Hub →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher in header for quick access */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
