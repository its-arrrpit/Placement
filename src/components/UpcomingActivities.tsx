'use client';

import React, { useMemo, useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import {
  Calendar,
  Clock,
  Laptop,
  Users,
  ExternalLink,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  company: string;
  role: string;
  type: 'Deadline' | 'Online Assessment' | 'Interview';
  dateStr: string;
  dateObj: Date | null;
  isToday: boolean;
  supersetLink: string;
}

function parseActivityDate(str?: string): Date | null {
  if (!str) return null;
  const clean = str.trim();
  if (!clean || clean.toLowerCase().includes('check') || clean.toLowerCase().includes('not')) {
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
  return null;
}

function isDateToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
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
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');

  const allActivities = useMemo(() => {
    const list: ActivityItem[] = [];

    drives.forEach((d) => {
      // 1. Deadline
      if (d.deadline && !d.deadline.toLowerCase().includes('check')) {
        const dObj = parseActivityDate(d.deadline);
        list.push({
          id: `${d.id}_deadline`,
          company: d.company,
          role: d.role,
          type: 'Deadline',
          dateStr: d.deadline,
          dateObj: dObj,
          isToday: isDateToday(dObj),
          supersetLink: d.supersetLink,
        });
      }

      // 2. Online Assessment Date
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
          supersetLink: d.supersetLink,
        });
      }

      // 3. Interview Date
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
          supersetLink: d.supersetLink,
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

  const displayedActivities = filterMode === 'today' ? todayActivities : allActivities;

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getTypeStyle = (type: ActivityItem['type']) => {
    switch (type) {
      case 'Deadline':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-rose-400" />,
          pill: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        };
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
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Today&apos;s Activities & Schedule
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {todayDateFormatted}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {filterMode === 'today'
                ? `Showing ${todayActivities.length} urgent action(s) for today`
                : `Showing all ${allActivities.length} upcoming events`}
            </p>
          </div>
        </div>

        {/* Filter Toggle: Today Only vs All Upcoming */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'today'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today ({todayActivities.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
                className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 bg-gradient-to-r from-rose-950/20 to-slate-900/90 shadow-sm shadow-rose-500/5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style.pill}`}
                  >
                    {style.icon}
                    <span>{act.type}</span>
                  </span>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
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
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{act.dateStr}</span>
                  </div>

                  <a
                    href={act.supersetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-300 transition-colors flex items-center gap-1 font-semibold text-indigo-400 text-xs"
                  >
                    <span>Apply on Superset</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>No deadlines or events scheduled for today. You&apos;re all caught up!</span>
        </div>
      )}
    </section>
  );
};
