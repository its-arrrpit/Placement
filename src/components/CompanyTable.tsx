'use client';

import React from 'react';
import { PlacementDrive } from '@/lib/db';
import { ExternalLink, Clock, Layers } from 'lucide-react';

interface CompanyTableProps {
  drives: PlacementDrive[];
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ drives }) => {
  const getTierTag = (tier: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('super dream')) {
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-semibold';
    }
    if (t.includes('dream')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 font-semibold';
    }
    if (t.includes('tier 1')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-semibold';
    }
    if (t.includes('tier 2') || t === '2') {
      return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 font-semibold';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-semibold';
  };

  return (
    <div className="panel rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 font-mono uppercase text-slate-400 dark:text-slate-500 text-[10px]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Company &amp; Role</th>
              <th className="py-2.5 px-3 font-semibold">Tier</th>
              <th className="py-2.5 px-3 font-semibold">CTC</th>
              <th className="py-2.5 px-3 font-semibold">Stipend</th>
              <th className="py-2.5 px-3 font-semibold">Cutoff</th>
              <th className="py-2.5 px-3 font-semibold">Schedule</th>
              <th className="py-2.5 px-3 font-semibold">Deadline</th>
              <th className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {drives.map((drive) => (
              <tr
                key={drive.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
              >
                {/* Company & Role */}
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {drive.company}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {drive.role}
                  </div>
                </td>

                {/* Tier */}
                <td className="py-3 px-3">
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${getTierTag(
                      drive.tier
                    )}`}
                  >
                    {drive.tier}
                  </span>
                </td>

                {/* CTC */}
                <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {drive.ctc}
                </td>

                {/* Stipend */}
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {drive.stipend || '—'}
                </td>

                {/* Cutoff */}
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {drive.cgpaCutoff ? `${drive.cgpaCutoff} CGPA` : '—'}
                </td>

                {/* Schedule (OA / Interview) */}
                <td className="py-3 px-3 font-mono whitespace-nowrap">
                  {drive.oaDate && (
                    <div className="mb-0.5">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        OA: {drive.oaDate}
                      </span>
                    </div>
                  )}
                  {drive.interviewDate && (
                    <div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Int: {drive.interviewDate}
                      </span>
                    </div>
                  )}
                  {!drive.oaDate && !drive.interviewDate && (
                    <span className="text-slate-400 dark:text-slate-600">—</span>
                  )}
                </td>

                {/* Deadline */}
                <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {drive.deadline}
                </td>

                {/* Action Link */}
                <td className="py-3 px-3 text-right">
                  <a
                    href={drive.supersetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
