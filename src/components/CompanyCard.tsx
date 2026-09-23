'use client';

import React, { useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import {
  ExternalLink,
  Calendar,
  Share2,
  Check,
  GraduationCap,
  Clock,
  Layers,
} from 'lucide-react';

interface CompanyCardProps {
  drive: PlacementDrive;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ drive }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(drive.supersetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierTag = (tier: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('super dream')) {
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    }
    if (t.includes('dream')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    }
    if (t.includes('tier 1')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (t.includes('tier 2') || t === '2') {
      return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div className="card rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs">
      <div>
        {/* Top Header Row: Tier Badge + Listed Date */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span
            className={`text-xs font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${getTierTag(
              drive.tier
            )}`}
          >
            {drive.tier}
          </span>

          {drive.dateListed && (
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Listed {drive.dateListed}
            </span>
          )}
        </div>

        {/* Company Identity & Role */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shrink-0 font-mono shadow-xs">
            {drive.company.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-snug truncate">
              {drive.company}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
              {drive.role}
            </p>
          </div>
        </div>

        {/* Compensation Matrix Block */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 font-mono">
          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-800 dark:text-emerald-400 block">
              CTC Package
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 truncate block mt-0.5">
              {drive.ctc}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 block">
              Stipend
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {drive.stipend || '—'}
            </span>
          </div>
        </div>

        {/* Schedule & Requirements Badges */}
        {(drive.cgpaCutoff || drive.oaDate || drive.interviewDate) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
            {drive.cgpaCutoff && (
              <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Min {drive.cgpaCutoff}</span>
              </span>
            )}
            {drive.oaDate && (
              <span className="px-2.5 py-1 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>OA: {drive.oaDate}</span>
              </span>
            )}
            {drive.interviewDate && (
              <span className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Int: {drive.interviewDate}</span>
              </span>
            )}
          </div>
        )}

        {/* Eligible Branches */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Eligible Branches</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {drive.eligibleBranches.map((branch) => (
              <span
                key={branch}
                className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              >
                {branch}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info & Direct Superset Action (Emerald Accent CTA - NOT blue, NOT dull black/white) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Deadline:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {drive.deadline}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={drive.supersetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
          >
            <span>Apply on Superset</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-100" />
          </a>

          <button
            onClick={handleCopyLink}
            className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Copy Superset Link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
