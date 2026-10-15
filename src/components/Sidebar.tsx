import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Users,
  UserCheck,
  Zap,
  Clock,
  FileText,
  DollarSign,
  BarChart3,
  Store,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Database,
  CalendarClock,
} from 'lucide-react';
import { NavTab, StoreProfile } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  urgentShiftsCount: number;
  pendingTimesheetsCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeStore: StoreProfile;
  stores: StoreProfile[];
  onSelectStore: (store: StoreProfile) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: {
    key: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  urgentShiftsCount,
  pendingTimesheetsCount,
  theme,
  onToggleTheme,
  activeStore,
  stores,
  onSelectStore,
  mobileOpen,
  onCloseMobile,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          key: 'roster',
          label: 'Weekly Roster',
          icon: CalendarDays,
          badge: urgentShiftsCount > 0 ? urgentShiftsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { key: 'calendar', label: 'Calendar', icon: Calendar },
      ],
    },
    {
      title: 'Workforce',
      items: [
        { key: 'staff', label: 'Staff Directory', icon: Users },
        { key: 'adhoc', label: 'Temporary Staff Pool', icon: UserCheck },
        {
          key: 'emergency',
          label: 'Emergency Cover',
          icon: Zap,
          badge: urgentShiftsCount > 0 ? urgentShiftsCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        { key: 'availability', label: 'Staff Availability', icon: CalendarClock },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          key: 'timesheets',
          label: 'Timesheets',
          icon: FileText,
          badge: pendingTimesheetsCount > 0 ? pendingTimesheetsCount : undefined,
          badgeColor: 'bg-indigo-500 text-white',
        },
        { key: 'salary', label: 'Salary & Payroll', icon: DollarSign },
        { key: 'reports', label: 'Reports & Insights', icon: BarChart3 },
      ],
    },
    {
      title: 'Management',
      items: [
        { key: 'stores', label: 'Company & Stall', icon: Store },
        { key: 'community', label: 'Community', icon: MessageSquare },
        { key: 'settings', label: 'Application Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    if (mobileOpen) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 transition-colors">
              WR
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  Weekly Roster
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  & Shift Operations
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Store / Stall Selector */}
        {!collapsed && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50">
            <label className="block text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1 px-1">
              Active Stall / Outlet
            </label>
            <div className="relative">
              <select
                value={activeStore.id}
                onChange={(e) => {
                  const s = stores.find((x) => x.id === e.target.value);
                  if (s) onSelectStore(s);
                }}
                className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate cursor-pointer shadow-2xs"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {/* Badge */}
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
                          collapsed ? 'absolute top-1 right-1' : ''
                        } ${item.badgeColor || 'bg-slate-700 text-white'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Area: Storage info & Theme Switcher */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-850/30">
          {!collapsed ? (
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                localStorage Demo
              </span>
              <button
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onToggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
