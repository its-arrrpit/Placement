'use client';

import React, { useState } from 'react';
import { PlacementDrive } from '@/lib/db';
import {
  ExternalLink,
  Calendar,
  Share2,
  Check,
  Clock,
  GraduationCap,
  CalendarDays,
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

  // Tier color styling
  const getTierBadge = (tier: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('super dream')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (t.includes('dream')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (t.includes('tier 1')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (t.includes('tier 2') || t === '2') {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-200 hover:border-slate-600/80 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Top Bar: Tier Badge + Listed Date */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTierBadge(
              drive.tier
            )}`}
          >
            {drive.tier}
          </span>

          {drive.dateListed && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Listed: {drive.dateListed}</span>
            </div>
          )}
        </div>

        {/* Company & Role */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            {drive.company.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
              {drive.company}
            </h3>
            <p className="text-xs text-slate-300 leading-snug mt-0.5 line-clamp-2">
              {drive.role}
            </p>
          </div>
        </div>

        {/* Prominent CTC & Stipend Side-by-Side Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
              Compensation (CTC)
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400 truncate block mt-0.5">
              {drive.ctc}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
              Stipend
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-cyan-300 truncate block mt-0.5">
              {drive.stipend || '—'}
            </span>
          </div>
        </div>

        {/* Highlights: CGPA Cutoff + Assessment Dates */}
        {(drive.cgpaCutoff || drive.oaDate || drive.interviewDate) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
            {drive.cgpaCutoff && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-amber-400" />
                <span>Cutoff: {drive.cgpaCutoff}</span>
              </span>
            )}
            {drive.oaDate && (
              <span className="px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-800/40 text-blue-300 font-medium flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-blue-400" />
                <span>OA: {drive.oaDate}</span>
              </span>
            )}
            {drive.interviewDate && (
              <span className="px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/40 text-purple-300 font-medium flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-purple-400" />
                <span>Interview: {drive.interviewDate}</span>
              </span>
            )}
          </div>
        )}

        {/* Eligible Departments */}
        <div className="mb-4">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-1.5">
            Eligible Departments
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {drive.eligibleBranches.map((branch) => (
              <span
                key={branch}
                className="px-2 py-0.5 rounded-md bg-slate-800/90 text-[11px] font-medium text-slate-200 border border-slate-700/70"
              >
                {branch}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        {/* Deadline */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium">Deadline:</span>
            <span className="font-semibold text-white">{drive.deadline}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={drive.supersetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Apply on Superset</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Copy Superset Link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
