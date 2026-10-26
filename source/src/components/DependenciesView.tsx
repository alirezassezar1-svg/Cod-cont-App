/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DependencyUpdates, TargetFrameworkStack } from '../types';
import { Package, Terminal, AlertTriangle, Copy, Check, Plus, Minus } from 'lucide-react';

interface DependenciesViewProps {
  updates: DependencyUpdates;
  migrationNotes: string[];
  targetStack: TargetFrameworkStack;
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({
  updates,
  migrationNotes,
  targetStack,
}) => {
  const [copiedInstall, setCopiedInstall] = useState(false);

  const packagesToAdd = Object.entries(updates.packageJson?.add || {});
  const packagesToRemove = updates.packageJson?.remove || [];

  const installCommand =
    packagesToAdd.length > 0
      ? `npm install ${packagesToAdd.map(([pkg]) => pkg).join(' ')}`
      : 'npm install';

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            3. Dependencies & Migration Checklist
          </h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Package updates for package.json / composer.json, installation commands, and essential lifecycle gotchas.
        </p>
      </div>

      {/* Terminal Command Box */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-mono text-xs text-slate-200">{installCommand}</span>
        </div>
        <button
          onClick={handleCopyInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors shrink-0"
        >
          {copiedInstall ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copiedInstall ? 'Copied' : 'Copy Command'}</span>
        </button>
      </div>

      {/* Package Delta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Packages to Add */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <Plus className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Packages to Add ({packagesToAdd.length})
            </h3>
          </div>
          {packagesToAdd.length > 0 ? (
            <ul className="space-y-2">
              {packagesToAdd.map(([name, ver]) => (
                <li
                  key={name}
                  className="flex items-center justify-between p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-xs font-mono"
                >
                  <span className="text-emerald-300 font-medium">{name}</span>
                  <span className="text-emerald-400/80">{ver}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No additional npm packages required.</p>
          )}
        </div>

        {/* Packages to Remove */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-rose-400">
            <Minus className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Packages to Remove ({packagesToRemove.length})
            </h3>
          </div>
          {packagesToRemove.length > 0 ? (
            <ul className="space-y-2">
              {packagesToRemove.map((name) => (
                <li
                  key={name}
                  className="p-2 rounded bg-rose-950/20 border border-rose-900/30 text-xs font-mono text-rose-300"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No deprecated packages need removal.</p>
          )}
        </div>
      </div>

      {/* Composer Updates (if present) */}
      {updates.composerJson?.add && Object.keys(updates.composerJson.add).length > 0 && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-3">
            PHP / Composer Dependencies (composer.json)
          </h3>
          <ul className="space-y-2">
            {Object.entries(updates.composerJson.add).map(([pkg, ver]) => (
              <li
                key={pkg}
                className="flex items-center justify-between p-2 rounded bg-purple-950/20 border border-purple-900/30 text-xs font-mono"
              >
                <span className="text-purple-300 font-medium">{pkg}</span>
                <span className="text-purple-400">{ver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Migration Gotchas & Notes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Migration Gotchas & Behavioral Nuances
          </h3>
        </div>

        <ul className="space-y-2.5">
          {migrationNotes.map((note, idx) => (
            <li
              key={idx}
              className="p-3.5 bg-slate-950 border border-amber-900/30 rounded-lg text-xs leading-relaxed text-slate-300 flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
