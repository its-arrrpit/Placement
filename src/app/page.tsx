'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlacementDrive } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { FilterBar } from '@/components/FilterBar';
import { CompanyCard } from '@/components/CompanyCard';
import { UpcomingActivities } from '@/components/UpcomingActivities';
import {
  Inbox,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
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

export default function PlacementTrackerPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Branch filters
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [showTodayOnly, setShowTodayOnly] = useState(false);

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

  // Initial load
  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  // Auto-refresh polling every 8 seconds so edits on phone reflect live on UI!
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

  // Client-side filtering
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      // Today only filter
      if (showTodayOnly) {
        const isDeadlineToday = isTodayDate(drive.deadline);
        const isOaToday = isTodayDate(drive.oaDate);
        const isInterviewToday = isTodayDate(drive.interviewDate);
        if (!isDeadlineToday && !isOaToday && !isInterviewToday) return false;
      }

      // Search filter
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

      // Branch filter
      if (selectedBranch !== 'All') {
        const query = selectedBranch.toUpperCase();
        const eligible = drive.eligibleBranches.some(
          (b) =>
            b.toUpperCase().includes(query) ||
            b.toUpperCase().includes('ALL') ||
            b.toUpperCase().includes('REFER')
        );
        if (!eligible) return false;
      }

      return true;
    });
  }, [drives, search, selectedBranch, showTodayOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBranch('All');
    setShowTodayOnly(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Navbar onRefresh={() => fetchPlacements(true)} isRefreshing={isRefreshing} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Clean Header Banner */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Placement Tracker 2026
          </h1>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Drives</span>
              <span className="text-base sm:text-lg font-black text-white">{drives.length}</span>
            </div>

            <button
              onClick={() => fetchPlacements(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Sync now"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Today's Activities & Schedule */}
        <UpcomingActivities drives={drives} />

        {/* Search & Department Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          showTodayOnly={showTodayOnly}
          onToggleTodayOnly={() => setShowTodayOnly((prev) => !prev)}
          totalFiltered={filteredDrives.length}
          onReset={handleResetFilters}
        />

        {/* Placements Grid */}
        <section id="placements-grid">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse space-y-4"
                >
                  <div className="h-6 bg-slate-800 rounded-full w-1/3" />
                  <div className="h-8 bg-slate-800 rounded-lg w-3/4" />
                  <div className="h-12 bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDrives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredDrives.map((drive) => (
                <CompanyCard key={drive.id} drive={drive} />
              ))}
            </div>
          ) : drives.length === 0 ? (
            /* First Time / Empty Sheet State */
            <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-indigo-500/20 max-w-lg mx-auto bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">
                Google Sheet Connected
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
                Add rows to your sheet to see placement cards here.
              </p>
              <button
                onClick={() => fetchPlacements(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Check for New Rows</span>
              </button>
            </div>
          ) : (
            /* Search Filter Empty State */
            <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-slate-800/80 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No placement drives found</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
                No drives match your current search or filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="w-full glass-panel border-t border-slate-800/80 mt-12 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-400">
            Placement Tracker &bull; 2026 Batch
          </span>
          <a
            href="https://app.joinsuperset.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <span>Superset Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
