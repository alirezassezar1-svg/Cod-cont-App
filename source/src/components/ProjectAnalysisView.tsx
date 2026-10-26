/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectAnalysis } from '../types';
import { Network, CheckCircle2, GitFork, Share2, Layers } from 'lucide-react';

interface ProjectAnalysisViewProps {
  analysis: ProjectAnalysis;
}

export const ProjectAnalysisView: React.FC<ProjectAnalysisViewProps> = ({ analysis }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* 1. Project Analysis Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">1. Project Analysis</h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Comprehensive inspection of component hierarchy, state stores, custom hooks, and shared modules across files.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="p-5 rounded-lg border border-slate-800 bg-slate-950/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Source Architecture Overview
        </h3>
        <p className="text-slate-200 text-sm leading-relaxed font-sans">
          {analysis.sourceSummary}
        </p>
      </div>

      {/* Inter-File Relationships & Flow */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Detected Inter-File Relationships & Module Graph
          </h3>
        </div>

        {analysis.relationships && analysis.relationships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.relationships.map((rel, idx) => {
              let typeBadge = 'bg-slate-800 text-slate-300';
              if (rel.type === 'uses-store') typeBadge = 'bg-amber-950 text-amber-300 border border-amber-800';
              if (rel.type === 'uses-hook') typeBadge = 'bg-sky-950 text-sky-300 border border-sky-800';
              if (rel.type === 'types') typeBadge = 'bg-purple-950 text-purple-300 border border-purple-800';
              if (rel.type === 'renders') typeBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-800';

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-sky-300 truncate font-medium">
                      {rel.from}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-mono ${typeBadge}`}>
                      {rel.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <GitFork className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono text-emerald-300 truncate">{rel.to}</span>
                  </div>
                  {rel.description && (
                    <div className="text-[11px] text-slate-500 mt-2 border-t border-slate-900 pt-1.5">
                      {rel.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No external module relationships detected.</p>
        )}
      </div>

      {/* Shared Modules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Shared Modules & Reusable Assets
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.sharedModules && analysis.sharedModules.length > 0 ? (
            analysis.sharedModules.map((mod, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {mod}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No shared cross-file modules identified</span>
          )}
        </div>
      </div>

      {/* Key Migration Decisions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Important Decisions Made During Conversion
          </h3>
        </div>
        <ul className="space-y-2.5">
          {analysis.keyDecisions.map((decision, index) => (
            <li
              key={index}
              className="p-3.5 bg-slate-950 border border-slate-800/90 rounded-lg flex items-start gap-3 text-xs leading-relaxed text-slate-300"
            >
              <span className="font-mono text-sky-400 font-semibold tabular-nums mt-0.5">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <span>{decision}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
