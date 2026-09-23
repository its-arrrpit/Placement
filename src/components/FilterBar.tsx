'use client';

import React from 'react';
import { Search, X, ArrowUpDown, LayoutGrid, ListFilter, SlidersHorizontal } from 'lucide-react';

export type DateSortOption = 'listed-desc' | 'listed-asc' | 'deadline-asc' | 'deadline-desc';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTier: string;
  onTierChange: (val: string) => void;
  availableTiers: string[];
  tierCounts: Record<string, number>;
  sortByDate: DateSortOption;
  onSortByDateChange: (val: DateSortOption) => void;
  showTodayOnly: boolean;
  onToggleTodayOnly: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedTier,
  onTierChange,
  availableTiers,
  tierCounts,
  sortByDate,
  onSortByDateChange,
  showTodayOnly,
  onToggleTodayOnly,
  viewMode,
  onViewModeChange,
  totalFiltered,
  onReset,
}) => {
  const isFiltered =
    search !== '' || selectedTier !== 'All' || showTodayOnly || sortByDate !== 'listed-desc';

  return (
    <div className="panel rounded-lg p-3.5 mb-6 space-y-3 border border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Controls Row: Search + Sort + View Mode Switcher */}
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="company-search-input"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter companies, roles, departments..."
            className="w-full pl-9 pr-8 py-2 rounded-md bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shrink-0">
            <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={sortByDate}
              onChange={(e) => onSortByDateChange(e.target.value as DateSortOption)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-medium focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="listed-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Listed (Newest)
              </option>
              <option value="listed-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Listed (Oldest)
              </option>
              <option value="deadline-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Deadline (Urgent First)
              </option>
              <option value="deadline-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                Deadline (Latest)
              </option>
            </select>
          </div>

          {/* Today's Only Quick Toggle */}
          <button
            onClick={onToggleTodayOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors border shrink-0 ${
              showTodayOnly
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showTodayOnly ? 'bg-white dark:bg-slate-900' : 'bg-slate-400'}`} />
            <span>Urgent Deadlines</span>
          </button>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center p-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors border border-slate-200 dark:border-slate-700 shrink-0 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tier Filter Segmented Control with Live Counts */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
          {availableTiers.map((tier) => {
            const isSelected = selectedTier === tier;
            const count = tierCounts[tier] ?? 0;

            return (
              <button
                key={tier}
                onClick={() => onTierChange(tier)}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>{tier}</span>
                <span
                  className={`text-xs font-mono px-1.5 rounded ${
                    isSelected
                      ? 'bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-slate-500 shrink-0 hidden sm:inline">
          {totalFiltered} drives
        </span>
      </div>
    </div>
  );
};
