/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConvertedFile, ProjectFile } from '../types';
import { computeDiff, DiffLine } from '../utils/converter-utils';
import { highlightCode } from '../utils/syntax-highlighter';
import {
  Copy,
  Check,
  Download,
  Split,
  FileCode,
  ArrowRight,
  Info,
  CheckCircle,
} from 'lucide-react';

interface DiffViewerProps {
  convertedFiles: ConvertedFile[];
  sourceFiles: ProjectFile[];
  onDownloadFile: (file: ConvertedFile) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  convertedFiles,
  sourceFiles,
  onDownloadFile,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    convertedFiles[0]?.path || ''
  );
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');
  const [copied, setCopied] = useState(false);

  const activeConverted =
    convertedFiles.find((f) => f.path === selectedPath) || convertedFiles[0];

  // Match the source file if it had an originalPath or matching name
  const originalFile = sourceFiles.find(
    (s) =>
      s.path === activeConverted?.originalPath ||
      s.path.split('/').pop()?.split('.')[0] ===
        activeConverted?.path.split('/').pop()?.split('.')[0]
  );

  const handleCopy = async () => {
    if (!activeConverted) return;
    await navigator.clipboard.writeText(activeConverted.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeConverted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-500 text-sm">
        No converted files available
      </div>
    );
  }

  const diffLines: DiffLine[] = computeDiff(
    originalFile?.content || '',
    activeConverted.content
  );

  const originalLines = (originalFile?.content || '').split('\n');
  const convertedLines = activeConverted.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Top File Selector Strip */}
      <div className="flex items-center justify-between bg-slate-950 border-b border-slate-800 px-4 py-2 shrink-0 overflow-x-auto gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {convertedFiles.map((f) => {
            const isSelected = f.path === activeConverted.path;
            const fileName = f.path.split('/').pop() || f.path;

            return (
              <button
                key={f.path}
                onClick={() => setSelectedPath(f.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-sky-950 text-sky-200 border border-sky-800 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{fileName}</span>
              </button>
            );
          })}
        </div>

        {/* Diff Mode Toggle & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setDiffMode('split')}
              className={`px-2.5 py-1 rounded transition-colors ${
                diffMode === 'split' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setDiffMode('unified')}
              className={`px-2.5 py-1 rounded transition-colors ${
                diffMode === 'unified' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Unified Diff
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Target'}</span>
          </button>

          <button
            onClick={() => onDownloadFile(activeConverted)}
            className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
            title="Download this single converted file"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Rationale & Explanation Card */}
      {activeConverted.explanation && (
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-start gap-3 shrink-0">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-200">Transformation Rationale:</span>
              <span className="font-mono text-sky-300">{activeConverted.path}</span>
              {activeConverted.originalPath && (
                <span className="text-slate-500 flex items-center gap-1">
                  (from <span className="font-mono">{activeConverted.originalPath}</span>)
                </span>
              )}
            </div>
            <p className="text-slate-400 leading-normal">{activeConverted.explanation}</p>
          </div>
        </div>
      )}

      {/* Main Diff Content */}
      <div className="flex-1 overflow-auto bg-[#0b0f17] font-mono text-[13px] leading-relaxed">
        {diffMode === 'split' ? (
          /* Side-by-Side Dual View */
          <div className="grid grid-cols-2 min-w-[900px] h-full divide-x divide-slate-800">
            {/* Left: Source File */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between shrink-0">
                <span className="font-semibold text-slate-300">
                  Source: {originalFile?.path || 'Original'}
                </span>
                <span className="tabular-nums text-slate-500">
                  {originalLines.length} lines
                </span>
              </div>
              <div className="flex-1 overflow-auto p-3 text-slate-300">
                {originalLines.map((line, idx) => (
                  <div key={idx} className="flex hover:bg-slate-900/60 leading-relaxed">
                    <span className="w-10 text-right pr-4 text-slate-600 select-none tabular-nums shrink-0">
                      {idx + 1}
                    </span>
                    <pre
                      className="flex-1 font-mono whitespace-pre text-slate-200"
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(line, originalFile?.language || 'typescript', originalFile?.path) || '&nbsp;',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Converted Target File */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-4 py-1.5 bg-sky-950/40 border-b border-slate-800 text-xs text-sky-300 flex items-center justify-between shrink-0">
                <span className="font-semibold text-sky-200">
                  Target: {activeConverted.path}
                </span>
                <span className="tabular-nums text-sky-400/80">
                  {convertedLines.length} lines
                </span>
              </div>
              <div className="flex-1 overflow-auto p-3 text-slate-200 bg-sky-950/5">
                {convertedLines.map((line, idx) => (
                  <div key={idx} className="flex hover:bg-sky-900/20 leading-relaxed">
                    <span className="w-10 text-right pr-4 text-slate-600 select-none tabular-nums shrink-0">
                      {idx + 1}
                    </span>
                    <pre
                      className="flex-1 font-mono whitespace-pre"
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(line, activeConverted.language, activeConverted.path) || '&nbsp;',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="p-4 space-y-0.5">
            <div className="mb-3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400 flex items-center justify-between">
              <span>
                Comparing <strong className="text-rose-400">{originalFile?.path || 'source'}</strong> →{' '}
                <strong className="text-emerald-400">{activeConverted.path}</strong>
              </span>
              <span className="text-[11px] text-slate-500">
                {diffLines.length} diff elements
              </span>
            </div>

            {diffLines.map((d, index) => {
              let bg = '';
              let textColor = 'text-slate-300';
              let prefix = ' ';

              if (d.type === 'add') {
                bg = 'bg-emerald-950/40 text-emerald-300';
                textColor = 'text-emerald-300';
                prefix = '+';
              } else if (d.type === 'remove') {
                bg = 'bg-rose-950/40 text-rose-300';
                textColor = 'text-rose-300';
                prefix = '-';
              }

              return (
                <div key={index} className={`flex px-2 py-0.5 rounded-sm ${bg} leading-relaxed`}>
                  <span className="w-10 text-right pr-2 text-slate-600 select-none tabular-nums shrink-0">
                    {d.oldLine || ''}
                  </span>
                  <span className="w-10 text-right pr-3 text-slate-600 select-none tabular-nums shrink-0">
                    {d.newLine || ''}
                  </span>
                  <span className="w-5 text-center text-slate-500 select-none font-bold shrink-0">
                    {prefix}
                  </span>
                  <pre
                    className={`flex-1 font-mono whitespace-pre ${textColor}`}
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(d.text, activeConverted.language, activeConverted.path) || '&nbsp;',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
