/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { buildFolderTree, TreeNode } from '../utils/converter-utils';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface ProjectFileTreeProps {
  files: ProjectFile[];
  selectedFileId: string;
  onSelectFile: (fileId: string) => void;
  onAddFileClick: () => void;
  onDeleteFile: (fileId: string) => void;
  onResetFiles: () => void;
}

export const ProjectFileTree: React.FC<ProjectFileTreeProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onAddFileClick,
  onDeleteFile,
  onResetFiles,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const tree = buildFolderTree(files);

  const toggleFolder = (path: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileBadgeColor = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'text-sky-400';
    if (name.endsWith('.vue')) return 'text-emerald-400';
    if (name.endsWith('.svelte')) return 'text-amber-400';
    if (name.endsWith('.blade.php') || name.endsWith('.php')) return 'text-purple-400';
    if (name.endsWith('.css')) return 'text-pink-400';
    return 'text-slate-400';
  };

  const renderTreeNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isCollapsed = collapsedFolders[node.path];

      if (node.isFolder) {
        return (
          <div key={node.path} className="select-none">
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-1.5 py-1 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded transition-colors text-left"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              {isCollapsed ? (
                <Folder className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              )}
              <span className="font-medium tracking-wide truncate">{node.name}</span>
            </button>
            {!isCollapsed && node.children && (
              <div>{renderTreeNodes(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isSelected = node.fileId === selectedFileId;

      return (
        <div
          key={node.path}
          className={`group flex items-center justify-between py-1 px-2 text-xs rounded transition-colors select-none ${
            isSelected
              ? 'bg-sky-950/80 text-sky-200 border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <button
            onClick={() => node.fileId && onSelectFile(node.fileId)}
            className="flex items-center gap-2 truncate flex-1 text-left"
          >
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${getFileBadgeColor(node.name)}`} />
            <span className="truncate">{node.name}</span>
          </button>
          {files.length > 1 && node.fileId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(node.fileId!);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
              title="Delete this file"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    });
  };

  const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Source Tree
          </span>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            ({files.length} files)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddFileClick}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Add new file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetFiles}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset files to active sample"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {renderTreeNodes(tree)}
      </div>

      {/* Footer Metrics */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Lines of Code</span>
        <span className="font-mono tabular-nums text-slate-300 font-medium">
          {totalLines.toLocaleString()}
        </span>
      </div>
    </aside>
  );
};
