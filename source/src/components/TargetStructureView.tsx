/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TargetStructure } from '../types';
import { FolderGit2, ArrowRight, Package, Box, Layers, Terminal } from 'lucide-react';

interface TargetStructureViewProps {
  structure: TargetStructure;
}

export const TargetStructureView: React.FC<TargetStructureViewProps> = ({ structure }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* 2. Target Structure Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FolderGit2 className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            2. Recommended Target Structure {structure.isMonorepo && '(With Monorepo)'}
          </h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          {structure.explanation ||
            'Target directory architecture redesigned according to modern framework standards and monorepo workspace boundaries.'}
        </p>
      </div>

      {/* Target Tree View ASCII / Code Box */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono font-medium text-slate-200">
              {structure.isMonorepo ? 'Workspace Architecture (Turborepo / pnpm)' : 'Target File Tree'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {structure.isMonorepo ? 'Monorepo Enabled' : 'Standard Layout'}
          </span>
        </div>
        <pre className="p-5 font-mono text-xs text-sky-300 leading-relaxed overflow-x-auto whitespace-pre">
          {structure.treeDescription}
        </pre>
      </div>

      {/* Monorepo Package Breakdown Cards (if monorepo) */}
      {structure.isMonorepo && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Monorepo Package Boundary Allocations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-semibold mb-1">
                <Box className="w-4 h-4" />
                <span>apps/web</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Root shell, routes, layouts, and page entry point configurations.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-semibold mb-1">
                <Package className="w-4 h-4" />
                <span>packages/ui</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Framework UI components, design system buttons, cards, and modals.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold mb-1">
                <Layers className="w-4 h-4" />
                <span>packages/shared</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Reactive stores (Pinia/Zustand), composables, hooks, and business logic.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold mb-1">
                <Terminal className="w-4 h-4" />
                <span>packages/types</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Strict TypeScript interfaces, models, and shared API response schemas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Mapping Table */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
          File Relocation & Transformation Mapping
        </h3>

        <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="px-4 py-3">Source File</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">Target Relocation</th>
                <th className="px-4 py-3">Migration Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {(structure.fileMapping || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                    {item.source}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </td>
                  <td className="px-4 py-3 font-mono text-sky-300 font-medium whitespace-nowrap">
                    {item.target}
                  </td>
                  <td className="px-4 py-3 text-slate-400 leading-normal">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
