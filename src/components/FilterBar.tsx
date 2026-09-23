'use client';

import React from 'react';
import { Search, X, Zap, ArrowUpDown } from 'lucide-react';

export type DateSortOption = 'listed-desc' | 'listed-asc' | 'deadline-asc' | 'deadline-desc';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTier: string;
  onTierChange: (val: string) => void;
  availableTiers: string[];
  sortByDate: DateSortOption;
  onSortByDateChange: (val: DateSortOption) => void;
  showTodayOnly: boolean;
  onToggleTodayOnly: () => void;
  totalFiltered: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedTier,
  onTierChange,
  availableTiers,
  sortByDate,
  onSortByDateChange,
  showTodayOnly,
  onToggleTodayOnly,
  totalFiltered,
  onReset,
}) => {
  const isFiltered =
    search !== '' || selectedTier !== 'All' || showTodayOnly || sortByDate !== 'listed-desc';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 space-y-4 border border-slate-800">
      {/* Search Input & Controls Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="company-search-input"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search company (e.g. Telstra, West Pharma), role, or branch..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort by Date Selector */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-400 font-medium shrink-0">Sort Date:</span>
          <select
            value={sortByDate}
            onChange={(e) => onSortByDateChange(e.target.value as DateSortOption)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
          >
            <option value="listed-desc" className="bg-slate-900 text-white">
              Date Listed (Newest)
            </option>
            <option value="listed-asc" className="bg-slate-900 text-white">
              Date Listed (Oldest)
            </option>
            <option value="deadline-asc" className="bg-slate-900 text-white">
              Deadline (Urgent First)
            </option>
            <option value="deadline-desc" className="bg-slate-900 text-white">
              Deadline (Latest)
            </option>
          </select>
        </div>

        {/* Today Only Button */}
        <button
          onClick={onToggleTodayOnly}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            showTodayOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
              : 'bg-slate-900/80 text-slate-400 border-slate-700/70 hover:text-slate-200'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${showTodayOnly ? 'text-rose-400' : 'text-slate-500'}`} />
          <span>Today&apos;s Deadlines Only</span>
        </button>

        {isFiltered && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-900/40 shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Tier Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filter by Tier
          </span>
          <span className="text-xs text-slate-400">
            Showing <strong className="text-white">{totalFiltered}</strong> drives
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {availableTiers.map((tier) => {
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => onTierChange(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/70 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
