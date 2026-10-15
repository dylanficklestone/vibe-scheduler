import React, { useState } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  MapPin,
  Clock,
  DollarSign,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { StoreProfile } from '../types';

interface CompanyStallSettingsProps {
  stores: StoreProfile[];
  activeStore: StoreProfile;
  onSelectStore: (store: StoreProfile) => void;
  onAddStore: (store: StoreProfile) => void;
  onUpdateStore: (store: StoreProfile) => void;
  onDeleteStore?: (storeId: string) => void;
}

export const CompanyStallSettings: React.FC<CompanyStallSettingsProps> = ({
  stores,
  activeStore,
  onSelectStore,
  onAddStore,
  onUpdateStore,
  onDeleteStore,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreProfile | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<StoreProfile['type']>('Coffee & Bakery');
  const [location, setLocation] = useState('');
  const [operatingHours, setOperatingHours] = useState('08:00 - 21:00 Daily');
  const [dailyRevenueTarget, setDailyRevenueTarget] = useState<number>(2500);
  const [weeklyTargetBudget, setWeeklyTargetBudget] = useState<number>(3200);

  const handleOpenAdd = () => {
    setEditingStore(null);
    setName('');
    setType('Coffee & Bakery');
    setLocation('12 Tanjong Pagar Road, #01-04');
    setOperatingHours('07:30 - 21:00 Daily');
    setDailyRevenueTarget(2600);
    setWeeklyTargetBudget(3300);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (store: StoreProfile) => {
    setEditingStore(store);
    setName(store.name);
    setType(store.type);
    setLocation(store.location);
    setOperatingHours(store.operatingHours);
    setDailyRevenueTarget(store.dailyRevenueTarget);
    setWeeklyTargetBudget(store.weeklyTargetBudget);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStore) {
      const updated: StoreProfile = {
        ...editingStore,
        name: name.trim(),
        type,
        location: location.trim(),
        operatingHours: operatingHours.trim(),
        dailyRevenueTarget: Number(dailyRevenueTarget) || 2000,
        weeklyTargetBudget: Number(weeklyTargetBudget) || 3000,
      };
      onUpdateStore(updated);
    } else {
      const created: StoreProfile = {
        id: `store_${Date.now()}`,
        name: name.trim(),
        type,
        location: location.trim(),
        operatingHours: operatingHours.trim(),
        dailyRevenueTarget: Number(dailyRevenueTarget) || 2000,
        weeklyTargetBudget: Number(weeklyTargetBudget) || 3000,
      };
      onAddStore(created);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Store className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Company Outlets & Stall Profiles
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your retail boutiques, coffee stalls, and food kiosks. Set operating budgets and daily targets per branch.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Outlet / Stall</span>
        </button>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stores.map((store) => {
          const isActive = store.id === activeStore.id;

          return (
            <div
              key={store.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all relative ${
                isActive
                  ? 'border-indigo-500 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {store.name}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                        Active Selection
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {store.type}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEdit(store)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Stall Settings"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{store.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{store.operatingHours}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Daily Sales Target
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${store.dailyRevenueTarget.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Weekly Labour Budget
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${store.weeklyTargetBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-1 flex items-center justify-end">
                {!isActive ? (
                  <button
                    onClick={() => onSelectStore(store)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Switch to this Outlet →
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Operations Rostering Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStore ? 'Edit Stall Profile' : 'Add New Outlet / Stall'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Roast & Bloom Central"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Outlet Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                >
                  <option value="Coffee & Bakery">Coffee & Bakery</option>
                  <option value="Retail Boutique">Retail Boutique</option>
                  <option value="Bistro & Grill">Bistro & Grill</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location / Address *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 28 Orchard Row, #01-12"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Operating Hours *
                </label>
                <input
                  type="text"
                  required
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g. 07:30 - 21:00 Daily"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Daily Sales Target ($)
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={dailyRevenueTarget}
                    onChange={(e) => setDailyRevenueTarget(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Weekly Budget ($)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={100}
                    value={weeklyTargetBudget}
                    onChange={(e) => setWeeklyTargetBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {editingStore ? 'Save Outlet' : 'Add Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
