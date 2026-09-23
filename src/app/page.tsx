'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlacementDrive } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { FilterBar, DateSortOption } from '@/components/FilterBar';
import { CompanyCard } from '@/components/CompanyCard';
import { CompanyTable } from '@/components/CompanyTable';
import { UpcomingActivities } from '@/components/UpcomingActivities';
import {
  Inbox,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Briefcase,
  CalendarClock,
  ClockAlert,
  Sparkles,
} from 'lucide-react';

function isTodayDate(str?: string): boolean {
  if (!str) return false;
  const clean = str.trim();
  let d: Date | null = null;
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    d = parsed;
  } else {
    const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  if (!d) return false;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function isTomorrowDate(str?: string): boolean {
  if (!str) return false;
  const clean = str.trim();
  let d: Date | null = null;
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    d = parsed;
  } else {
    const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  if (!d) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

function parseSortDate(str?: string): number {
  if (!str) return 0;
  const clean = str.trim();
  if (
    !clean ||
    clean.toLowerCase().includes('closed') ||
    clean.toLowerCase().includes('check') ||
    clean.toLowerCase().includes('not') ||
    clean.toLowerCase().includes('tba') ||
    clean.toLowerCase().includes('tbd')
  ) {
    return 0;
  }
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    return parsed.getTime();
  }
  const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])).getTime();
  }
  const m2 = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m2) {
    return new Date(parseInt(m2[3]), parseInt(m2[2]) - 1, parseInt(m2[1])).getTime();
  }
  return 0;
}

export default function PlacementTrackerPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [sortByDate, setSortByDate] = useState<DateSortOption>('deadline-desc');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchPlacements = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await fetch(`/api/placements?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setDrives(data.placements);
      }
    } catch (err) {
      console.error('Failed to load placements:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  // Polling updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlacements(true);
    }, 8000);

    const handleFocus = () => fetchPlacements(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPlacements]);

  // Tiers and counts
  const availableTiers = useMemo(() => {
    const rawTiers = drives.map((d) => d.tier).filter(Boolean);
    const unique = Array.from(new Set(rawTiers));
    unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return ['All', ...unique];
  }, [drives]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { All: drives.length };
    drives.forEach((d) => {
      const t = d.tier || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [drives]);

  // Telemetry metrics
  const metrics = useMemo(() => {
    let todayEvents = 0;
    let tomorrowEvents = 0;
    let todayDeadlines = 0;

    drives.forEach((d) => {
      if (isTodayDate(d.oaDate) || isTodayDate(d.interviewDate)) todayEvents++;
      if (isTomorrowDate(d.oaDate) || isTomorrowDate(d.interviewDate)) tomorrowEvents++;
      if (isTodayDate(d.deadline)) todayDeadlines++;
    });

    return {
      total: drives.length,
      todayEvents,
      tomorrowEvents,
      todayDeadlines,
    };
  }, [drives]);

  // Filtered and sorted drives
  const filteredDrives = useMemo(() => {
    const list = drives.filter((drive) => {
      if (showTodayOnly) {
        const isDeadlineToday = isTodayDate(drive.deadline);
        const isOaToday = isTodayDate(drive.oaDate);
        const isInterviewToday = isTodayDate(drive.interviewDate);
        if (!isDeadlineToday && !isOaToday && !isInterviewToday) return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchCompany = drive.company.toLowerCase().includes(query);
        const matchRole = drive.role.toLowerCase().includes(query);
        const matchTier = drive.tier.toLowerCase().includes(query);
        const matchBranch = drive.eligibleBranches.some((b) =>
          b.toLowerCase().includes(query)
        );
        if (!matchCompany && !matchRole && !matchTier && !matchBranch) return false;
      }

      if (selectedTier !== 'All') {
        if (drive.tier.toLowerCase() !== selectedTier.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortByDate === 'listed-desc') {
        return parseSortDate(b.dateListed) - parseSortDate(a.dateListed);
      }
      if (sortByDate === 'listed-asc') {
        return parseSortDate(a.dateListed) - parseSortDate(b.dateListed);
      }
      if (sortByDate === 'deadline-asc') {
        const tA = parseSortDate(a.deadline);
        const tB = parseSortDate(b.deadline);
        if (!tA && !tB) return 0;
        if (!tA) return 1;
        if (!tB) return -1;
        return tA - tB;
      }
      if (sortByDate === 'deadline-desc') {
        const tA = parseSortDate(a.deadline);
        const tB = parseSortDate(b.deadline);
        if (!tA && !tB) return 0;
        if (!tA) return 1;
        if (!tB) return -1;
        return tB - tA;
      }
      return 0;
    });

    return list;
  }, [drives, search, selectedTier, showTodayOnly, sortByDate]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTier('All');
    setSortByDate('deadline-desc');
    setShowTodayOnly(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/60 dark:from-[#0d1322] dark:via-[#0b0f19] dark:to-[#080c14] text-slate-800 dark:text-slate-100 transition-colors relative">
      {/* Subtle ambient light gradient at the top */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_35%_at_50%_-5%,rgba(148,163,184,0.1),transparent)] dark:bg-[radial-gradient(ellipse_80%_35%_at_50%_-5%,rgba(59,130,246,0.06),transparent)]" />

      <Navbar
        onRefresh={() => fetchPlacements(true)}
        isRefreshing={isRefreshing}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Operations Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          {/* Metric 1: Total Drives */}
          <div className="panel rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors shadow-xs">
            <div>
              <span className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Pipeline
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
                {metrics.total}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Today Events */}
          <div
            onClick={() => setShowTodayOnly((prev) => !prev)}
            className="panel rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">
                  Today&apos;s Events
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
                {metrics.todayEvents}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: Tomorrow Events */}
          <div className="panel rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors shadow-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">
                  Tomorrow
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
                {metrics.tomorrowEvents}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4: Deadlines Today */}
          <div
            onClick={() => setShowTodayOnly(true)}
            className="panel rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">
                  Closing Today
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
                {metrics.todayDeadlines}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center shrink-0">
              <ClockAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Daily Action Agenda */}
        <UpcomingActivities drives={drives} />

        {/* Control and Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedTier={selectedTier}
          onTierChange={setSelectedTier}
          availableTiers={availableTiers}
          tierCounts={tierCounts}
          sortByDate={sortByDate}
          onSortByDateChange={setSortByDate}
          showTodayOnly={showTodayOnly}
          onToggleTodayOnly={() => setShowTodayOnly((prev) => !prev)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredDrives.length}
          onReset={handleResetFilters}
        />

        {/* Placements Section (Grid or Table View) */}
        <section id="placements-content">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="card rounded-lg p-4 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
                >
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDrives.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredDrives.map((drive) => (
                  <CompanyCard key={drive.id} drive={drive} />
                ))}
              </div>
            ) : (
              <CompanyTable drives={filteredDrives} />
            )
          ) : drives.length === 0 ? (
            /* Empty Sheet Connected State */
            <div className="panel rounded-lg p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-slate-300 dark:border-slate-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Google Sheet Connected
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                Add rows to your sheet to see placement records populate here.
              </p>
              <button
                onClick={() => fetchPlacements(true)}
                className="px-4 py-2 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Check for New Rows</span>
              </button>
            </div>
          ) : (
            /* Filter Empty State */
            <div className="panel rounded-lg p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-300 dark:border-slate-700">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                No matching placement drives
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                No drives match your current filter combination.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Structured Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] mt-12 py-5 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono">Placement Terminal &bull; 2026 Batch</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert('Placement Policies: Drives and eligibility criteria are subject to Campus Placement Cell regulations.');
              }}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Terms of Placement
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert('Privacy Policy: Student data and drive schedules are synchronized strictly for educational campus placement assistance.');
              }}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </a>
          </div>

          <a
            href="https://app.joinsuperset.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>Superset Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
