'use client';

import React, { useMemo, useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import {
  Calendar,
  Clock,
  Laptop,
  Users,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  company: string;
  role: string;
  type: 'Online Assessment' | 'Interview';
  dateStr: string;
  dateObj: Date | null;
  isToday: boolean;
  isTomorrow: boolean;
}

function parseActivityDate(str?: string): Date | null {
  if (!str) return null;
  const clean = str.trim();
  if (
    !clean ||
    clean.toLowerCase().includes('check') ||
    clean.toLowerCase().includes('not') ||
    clean.toLowerCase().includes('tba') ||
    clean.toLowerCase().includes('tbd')
  ) {
    return null;
  }
  const parsed = new Date(clean.replace(/Sept\b/i, 'Sep'));
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  const m = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  const m2 = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m2) {
    return new Date(parseInt(m2[3]), parseInt(m2[2]) - 1, parseInt(m2[1]));
  }
  return null;
}

function isSameDay(d1: Date | null, d2: Date): boolean {
  if (!d1) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function isDateToday(date: Date | null): boolean {
  return isSameDay(date, new Date());
}

function isDateTomorrow(date: Date | null): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

function getRelativeDateLabel(date: Date | null, rawStr: string): string {
  if (!date) return rawStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)}d ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  return rawStr;
}

export const UpcomingActivities: React.FC<{ drives: PlacementDrive[] }> = ({ drives }) => {
  const [filterMode, setFilterMode] = useState<'today' | 'tomorrow' | 'all'>('today');

  const allActivities = useMemo(() => {
    const list: ActivityItem[] = [];

    drives.forEach((d) => {
      // 1. Online Assessment Date
      if (d.oaDate) {
        const dObj = parseActivityDate(d.oaDate);
        list.push({
          id: `${d.id}_oa`,
          company: d.company,
          role: d.role,
          type: 'Online Assessment',
          dateStr: d.oaDate,
          dateObj: dObj,
          isToday: isDateToday(dObj),
          isTomorrow: isDateTomorrow(dObj),
        });
      }

      // 2. Interview Date
      if (d.interviewDate) {
        const dObj = parseActivityDate(d.interviewDate);
        list.push({
          id: `${d.id}_interview`,
          company: d.company,
          role: d.role,
          type: 'Interview',
          dateStr: d.interviewDate,
          dateObj: dObj,
          isToday: isDateToday(dObj),
          isTomorrow: isDateTomorrow(dObj),
        });
      }
    });

    // Sort chronologically
    list.sort((a, b) => {
      if (!a.dateObj) return 1;
      if (!b.dateObj) return -1;
      return a.dateObj.getTime() - b.dateObj.getTime();
    });

    return list;
  }, [drives]);

  const todayActivities = useMemo(() => {
    return allActivities.filter((a) => a.isToday);
  }, [allActivities]);

  const tomorrowActivities = useMemo(() => {
    return allActivities.filter((a) => a.isTomorrow);
  }, [allActivities]);

  const displayedActivities = useMemo(() => {
    if (filterMode === 'today') return todayActivities;
    if (filterMode === 'tomorrow') return tomorrowActivities;
    return allActivities;
  }, [filterMode, todayActivities, tomorrowActivities, allActivities]);

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDateFormatted = tomorrowDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getTypeStyle = (type: ActivityItem['type']) => {
    switch (type) {
      case 'Online Assessment':
        return {
          icon: <Laptop className="w-3.5 h-3.5 text-blue-400" />,
          pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        };
      case 'Interview':
        return {
          icon: <Users className="w-3.5 h-3.5 text-purple-400" />,
          pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        };
    }
  };

  return (
    <section className="mb-6 p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3.5">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                {filterMode === 'today'
                  ? "Today's OA & Interviews"
                  : filterMode === 'tomorrow'
                  ? "Tomorrow's OA & Interviews"
                  : 'Upcoming OA & Interviews'}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {filterMode === 'today'
                  ? todayDateFormatted
                  : filterMode === 'tomorrow'
                  ? tomorrowDateFormatted
                  : `${allActivities.length} Events`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {filterMode === 'today'
                ? `Showing ${todayActivities.length} scheduled assessment(s) & interview(s) for today`
                : filterMode === 'tomorrow'
                ? `Showing ${tomorrowActivities.length} scheduled assessment(s) & interview(s) for tomorrow`
                : `Showing all ${allActivities.length} upcoming OA and interview events`}
            </p>
          </div>
        </div>

        {/* Filter Toggle: Today, Tomorrow, All Upcoming */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterMode === 'today'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today ({todayActivities.length})
          </button>
          <button
            onClick={() => setFilterMode('tomorrow')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterMode === 'tomorrow'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tomorrow ({tomorrowActivities.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Upcoming ({allActivities.length})
          </button>
        </div>
      </div>

      {/* Grid of activities */}
      {displayedActivities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {displayedActivities.map((act) => {
            const style = getTypeStyle(act.type);
            const relativeLabel = getRelativeDateLabel(act.dateObj, act.dateStr);

            return (
              <div
                key={act.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  act.isToday
                    ? 'bg-gradient-to-r from-rose-950/20 to-slate-900/90 border-rose-500/30 shadow-sm shadow-rose-500/5'
                    : act.isTomorrow
                    ? 'bg-gradient-to-r from-amber-950/20 to-slate-900/90 border-amber-500/30 shadow-sm shadow-amber-500/5'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style.pill}`}
                  >
                    {style.icon}
                    <span>{act.type}</span>
                  </span>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      act.isToday
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : act.isTomorrow
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {relativeLabel}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm truncate">
                    {act.company}
                  </h4>
                  <p className="text-xs text-slate-300 truncate mt-0.5">
                    {act.role}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        act.type === 'Interview' ? 'text-purple-400' : 'text-blue-400'
                      }`}
                    />
                    <span>{act.dateStr}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {act.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {filterMode === 'today'
              ? 'No online assessments or interviews scheduled for today.'
              : filterMode === 'tomorrow'
              ? 'No online assessments or interviews scheduled for tomorrow.'
              : 'No upcoming online assessments or interviews scheduled.'}
          </span>
        </div>
      )}
    </section>
  );
};
