/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRightLeft, Download, RefreshCw, FolderGit2, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onConvert: () => void;
  isConverting: boolean;
  onExportZip: () => void;
  hasConvertedResult: boolean;
  activeView: 'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies';
  setActiveView: (view: 'editor' | 'diff' | 'analysis' | 'structure' | 'dependencies') => void;
  fileCount: number;
  engine?: 'gemini-3.8-flash' | 'ast-deterministic';
  latencyMs?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onConvert,
  isConverting,
  onExportZip,
  hasConvertedResult,
  activeView,
  setActiveView,
  fileCount,
  engine,
  latencyMs,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between gap-8 select-none shrink-0">
      {/* Zone 1: Brand Wordmark (Single text element in display face) */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-base font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
          <ArrowRightLeft className="w-5 h-5 text-sky-400 shrink-0" />
          <span>Code Converter Pro</span>
          <span className="text-xs text-sky-400 font-mono font-medium ml-1">v4.0</span>
        </a>
      </div>

      {/* Zone 2: Navigation views */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveView('editor')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeView === 'editor' ? 'text-white border-b-2 border-sky-500' : ''
          }`}
        >
          Source Editor ({fileCount})
        </button>

        <button
          onClick={() => setActiveView('diff')}
          disabled={!hasConvertedResult}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            !hasConvertedResult ? 'opacity-40 cursor-not-allowed' : ''
          } ${activeView === 'diff' ? 'text-white border-b-2 border-sky-500' : ''}`}
        >
          Diff & Converted
        </button>

        <button
          onClick={() => setActiveView('analysis')}
          disabled={!hasConvertedResult}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            !hasConvertedResult ? 'opacity-40 cursor-not-allowed' : ''
          } ${activeView === 'analysis' ? 'text-white border-b-2 border-sky-500' : ''}`}
        >
          Project Analysis
        </button>

        <button
          onClick={() => setActiveView('structure')}
          disabled={!hasConvertedResult}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            !hasConvertedResult ? 'opacity-40 cursor-not-allowed' : ''
          } ${activeView === 'structure' ? 'text-white border-b-2 border-sky-500' : ''}`}
        >
          Target Monorepo
        </button>

        <button
          onClick={() => setActiveView('dependencies')}
          disabled={!hasConvertedResult}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            !hasConvertedResult ? 'opacity-40 cursor-not-allowed' : ''
          } ${activeView === 'dependencies' ? 'text-white border-b-2 border-sky-500' : ''}`}
        >
          Dependencies
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {engine && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                engine === 'gemini-3.8-flash' ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-slate-300">
              {engine === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Deterministic AST'}
            </span>
            {latencyMs !== undefined && (
              <span className="text-slate-500 tabular-nums">· {latencyMs}ms</span>
            )}
          </div>
        )}

        {hasConvertedResult && (
          <button
            onClick={onExportZip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
            title="Download target files as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export ZIP</span>
          </button>
        )}

        <button
          onClick={onConvert}
          disabled={isConverting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          {isConverting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Transforming Codebase...</span>
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{hasConvertedResult ? 'Re-convert Project' : 'Convert Project'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
