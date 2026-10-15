import React, { useState } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  DollarSign,
  User,
  Shield,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { StoreProfile } from '../types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: StoreProfile[];
  activeStore: StoreProfile;
  onSelectStore: (store: StoreProfile) => void;
  onAddStore: (newStore: StoreProfile) => void;
  onUpdateStore: (updatedStore: StoreProfile) => void;
  onDeleteStore: (storeId: string) => void;
}

const STORE_TYPES: StoreProfile['type'][] = [
  'Coffee & Bakery',
  'Retail Boutique',
  'Bistro & Grill',
  'Quick Service F&B',
  'Specialty Retail',
];

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  stores,
  activeStore,
  onSelectStore,
  onAddStore,
  onUpdateStore,
  onDeleteStore,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<StoreProfile['type']>('Coffee & Bakery');
  const [storeCode, setStoreCode] = useState('');
  const [location, setLocation] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [dailyRevenueTarget, setDailyRevenueTarget] = useState<number>(2500);
  const [weeklyTargetBudget, setWeeklyTargetBudget] = useState<number>(3200);
  const [minStaffOnFloor, setMinStaffOnFloor] = useState<number>(2);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const openCreateForm = () => {
    setViewMode('create');
    setEditingStoreId(null);
    setName('');
    setType('Coffee & Bakery');
    setStoreCode(`SG-OUTLET-00${stores.length + 1}`);
    setLocation('');
    setOpeningTime('08:00');
    setClosingTime('22:00');
    setManagerName('');
    setManagerPhone('');
    setManagerEmail('');
    setDailyRevenueTarget(2600);
    setWeeklyTargetBudget(3400);
    setMinStaffOnFloor(2);
    setNotes('');
    setErrorMsg(null);
  };

  const openEditForm = (store: StoreProfile) => {
    setViewMode('edit');
    setEditingStoreId(store.id);
    setName(store.name);
    setType(store.type);
    setStoreCode(store.storeCode || `SG-STORE-${store.id}`);
    setLocation(store.location);
    setOpeningTime(store.openingTime || '08:00');
    setClosingTime(store.closingTime || '22:00');
    setManagerName(store.managerName || '');
    setManagerPhone(store.managerPhone || '');
    setManagerEmail(store.managerEmail || '');
    setDailyRevenueTarget(store.dailyRevenueTarget);
    setWeeklyTargetBudget(store.weeklyTargetBudget);
    setMinStaffOnFloor(store.minStaffOnFloor || 2);
    setNotes(store.notes || '');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Store name is required.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Store address / location is required.');
      return;
    }

    const payload: StoreProfile = {
      id: viewMode === 'edit' && editingStoreId ? editingStoreId : `store_${Date.now()}`,
      name: name.trim(),
      type,
      storeCode: storeCode.trim() || undefined,
      location: location.trim(),
      operatingHours: `${openingTime} - ${closingTime} Daily`,
      openingTime,
      closingTime,
      managerName: managerName.trim() || 'Store Manager',
      managerPhone: managerPhone.trim() || '+65 9000 0000',
      managerEmail: managerEmail.trim() || 'store@example.com',
      dailyRevenueTarget: Number(dailyRevenueTarget),
      weeklyTargetBudget: Number(weeklyTargetBudget),
      minStaffOnFloor: Number(minStaffOnFloor),
      isFranchise: true,
      notes: notes.trim() || undefined,
    };

    if (viewMode === 'edit') {
      onUpdateStore(payload);
    } else {
      onAddStore(payload);
      onSelectStore(payload); // auto-switch to newly added store
    }

    setViewMode('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {viewMode === 'list' && 'Franchise Stores & Outlet Settings'}
                  {viewMode === 'create' && 'Add New Franchise Store / Outlet'}
                  {viewMode === 'edit' && 'Edit Store Profile & Operational Rules'}
                </h2>
                <span className="text-xs font-mono text-slate-500">
                  {stores.length} Managed {stores.length === 1 ? 'Outlet' : 'Outlets'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure operational hours, revenue goals, and staffing budgets for single-store and franchise branches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'list' ? (
              <button
                onClick={openCreateForm}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('list')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                ← Back to Stores List
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stores.map((store) => {
                  const isActive = store.id === activeStore.id;

                  return (
                    <div
                      key={store.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-slate-50/70 border-slate-900 ring-1 ring-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header: Name, Store Code, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">{store.name}</h3>
                              {isActive && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded">
                                  <Check className="w-2.5 h-2.5" />
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                              <span>{store.type}</span>
                              {store.storeCode && (
                                <>
                                  <span>·</span>
                                  <span>Code: {store.storeCode}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditForm(store)}
                              title="Edit store settings"
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {stores.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove outlet "${store.name}"?`)) {
                                    onDeleteStore(store.id);
                                  }
                                }}
                                title="Remove outlet"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Location & Hours */}
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{store.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{store.operatingHours}</span>
                          </div>
                          {store.managerName && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Lead: {store.managerName} ({store.managerPhone || 'N/A'})</span>
                            </div>
                          )}
                        </div>

                        {/* Financial Targets Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                          <div className="bg-white p-2 rounded border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-sans block">Daily Sales Target</span>
                            <span className="font-bold text-slate-900">${store.dailyRevenueTarget.toLocaleString()}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-sans block">Weekly Labor Budget</span>
                            <span className="font-bold text-slate-900">${store.weeklyTargetBudget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Switch Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Min Floor: {store.minStaffOnFloor || 2} staff
                        </span>

                        {!isActive ? (
                          <button
                            onClick={() => {
                              onSelectStore(store);
                              onClose();
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            Switch to this Store →
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Current Portal Scope
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CREATE / EDIT FORM */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store / Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roast & Bloom - Jewel Changi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Concept / Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as StoreProfile['type'])}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  >
                    {STORE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Store Code & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Franchise Store Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SG-RB-003"
                    value={storeCode}
                    onChange={(e) => setStoreCode(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Address / Mall Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 78 Airport Blvd, #02-210 Jewel Changi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Daily Opening Time
                  </label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded-md px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Daily Closing Time
                  </label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded-md px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Min Floor Staff / Shift
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={minStaffOnFloor}
                    onChange={(e) => setMinStaffOnFloor(parseInt(e.target.value) || 1)}
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded-md px-2.5 py-1.5"
                  />
                </div>
              </div>

              {/* Manager Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel Wong"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+65 9123 4567"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager Email
                  </label>
                  <input
                    type="email"
                    placeholder="manager@store.com"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Financial Goals & Budgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Revenue Target ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      step="50"
                      value={dailyRevenueTarget}
                      onChange={(e) => setDailyRevenueTarget(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Projected weekly sales: ${(dailyRevenueTarget * 7).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weekly Labor Cost Budget ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      step="50"
                      value={weeklyTargetBudget}
                      onChange={(e) => setWeeklyTargetBudget(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Target labor-to-sales ratio: {((weeklyTargetBudget / (dailyRevenueTarget * 7 || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Franchise & Outlet Specific Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Keyholder rules, mall loading bay access times, register floats"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {viewMode === 'edit' ? 'Save Store Settings' : 'Create Outlet'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div>
            Franchise Multi-Outlet Governance · All changes sync with Roster & Payroll
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
