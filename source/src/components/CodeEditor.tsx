/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { Copy, Check, FileCode, Code, Eye } from 'lucide-react';
import { highlightCode } from '../utils/syntax-highlighter';

interface CodeEditorProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onUpdateContent: (id: string, newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'highlight' | 'edit'>('highlight');

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCopy = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      if (activeFile) {
        onUpdateContent(activeFile.id, nextVal);
      }
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-500 text-xs">
        No file selected
      </div>
    );
  }

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* File Tabs */}
      <div className="flex items-center bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0">
        {files.map((file) => {
          const isActive = file.id === activeFile.id;
          const fileName = file.path.split('/').pop() || file.path;

          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs border-r border-slate-800 transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white border-t-2 border-t-sky-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{fileName}</span>
              {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Editor Subheader: File path & actions */}
      <div className="px-4 py-1.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-500">{activeFile.path}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{lines.length} lines</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switch: Syntax Highlighted View vs Plain Textarea Editor */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setMode('highlight')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                mode === 'highlight' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Syntax Highlighted View"
            >
              <Eye className="w-3 h-3" />
              <span>Syntax</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                mode === 'edit' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Edit code text"
            >
              <Code className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors text-[11px]"
            title="Copy file contents"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-[13px] leading-relaxed bg-[#0b0f17]">
        {/* Line Numbers Gutter */}
        <div
          aria-hidden="true"
          className="w-12 py-3 pr-3 text-right bg-slate-950/40 text-slate-600 select-none border-r border-slate-800/60 shrink-0 overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i} className="tabular-nums">
              {i + 1}
            </div>
          ))}
        </div>

        {mode === 'highlight' ? (
          /* High-Fidelity Syntax Highlighted View */
          <div
            onClick={() => setMode('edit')}
            className="flex-1 w-full h-full p-3 overflow-auto cursor-text text-slate-200"
            title="Click to edit"
          >
            {lines.map((line, idx) => (
              <div key={idx} className="leading-relaxed hover:bg-slate-900/40">
                <pre
                  className="font-mono whitespace-pre inline"
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(line, activeFile.language, activeFile.path) || '&nbsp;',
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Interactive Editable Textarea */
          <textarea
            value={activeFile.content}
            onChange={(e) => onUpdateContent(activeFile.id, e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoFocus
            className="flex-1 w-full h-full p-3 bg-transparent text-slate-200 resize-none focus:outline-none overflow-auto font-mono text-[13px] leading-relaxed selection:bg-sky-500/30"
            placeholder="Enter file code..."
          />
        )}
      </div>
    </div>
  );
};
