'use client';

import React, { useMemo, useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import { Calendar, Laptop, Users, Clock } from 'lucide-react';

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

export const UpcomingActivities: React.FC<{ drives: PlacementDrive[] }> = ({ drives }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');

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

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDateFormatted = tomorrowDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const currentActivities = activeTab === 'today' ? todayActivities : tomorrowActivities;
  const currentDateFormatted = activeTab === 'today' ? todayDateFormatted : tomorrowDateFormatted;

  const renderActivityCard = (act: ActivityItem, period: 'today' | 'tomorrow') => {
    const isOA = act.type === 'Online Assessment';

    return (
      <div
        key={act.id}
        className="bg-gradient-to-b from-white to-slate-50/70 dark:from-[#111827] dark:to-[#0e1422] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-xs"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm font-mono shrink-0">
              {act.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate block">
                {act.company}
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {act.role}
              </p>
            </div>
          </div>

          <span className="text-xs font-medium px-2.5 py-1 rounded-md shrink-0 inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {isOA ? <Laptop className="w-3.5 h-3.5 text-slate-400" /> : <Users className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isOA ? 'Assessment' : 'Interview'}</span>
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300 font-medium">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>{act.dateStr}</span>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {period === 'today' ? 'Today' : 'Tomorrow'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="relative overflow-hidden mb-6 rounded-xl bg-gradient-to-b from-white via-white to-slate-50/50 dark:from-[#111827] dark:via-[#111827] dark:to-[#0d131f] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
      {/* Ultra-minimal subtle top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
      {/* Title & Tab Controls (Only Today and Tomorrow) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Daily Action Agenda
              </h2>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {todayActivities.length + tomorrowActivities.length} Scheduled
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled assessments &amp; interviews
            </p>
          </div>
        </div>

        {/* View Switcher: Only Today & Tomorrow */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm self-start sm:self-auto font-medium">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'today'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Today ({todayActivities.length})
          </button>

          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'tomorrow'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tomorrow ({tomorrowActivities.length})
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            {activeTab === 'today' ? "Today's Lineup" : "Tomorrow's Lineup"}
          </span>
          <span className="font-mono text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {currentDateFormatted}
          </span>
        </div>

        {currentActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentActivities.map((act) => renderActivityCard(act, activeTab))}
          </div>
        ) : (
          <div className="p-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            No online assessments or interviews scheduled for {activeTab === 'today' ? 'today' : 'tomorrow'}
          </div>
        )}
      </div>
    </section>
  );
};
