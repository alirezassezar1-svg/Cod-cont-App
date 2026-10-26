/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FrameworkStack =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'solid'
  | 'laravel-blade'
  | 'class-components'
  | 'css';

export type TargetFrameworkStack =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'solid'
  | 'laravel-inertia-react'
  | 'laravel-inertia-vue'
  | 'livewire'
  | 'tailwind';

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  isModified?: boolean;
}

export interface ConversionConfig {
  sourceStack: FrameworkStack;
  targetStack: TargetFrameworkStack;
  useTypeScript: boolean;
  architecture: 'standard' | 'monorepo' | 'feature-sliced';
  preserveComments: boolean;
  stateStrategy: 'auto' | 'pinia' | 'zustand' | 'svelte-runes' | 'signals' | 'context';
}

export interface FileRelationship {
  from: string;
  to: string;
  type: 'imports' | 'uses-hook' | 'uses-store' | 'types' | 'renders';
  description?: string;
}

export interface ConvertedFile {
  path: string;
  originalPath?: string;
  content: string;
  language: string;
  explanation: string;
  status: 'created' | 'modified' | 'renamed' | 'removed';
}

export interface FileMapping {
  source: string;
  target: string;
  reason: string;
}

export interface DependencyUpdates {
  packageJson?: {
    add?: Record<string, string>;
    remove?: string[];
    scripts?: Record<string, string>;
  };
  composerJson?: {
    add?: Record<string, string>;
    remove?: string[];
  };
  notes: string[];
}

export interface ProjectAnalysis {
  sourceSummary: string;
  relationships: FileRelationship[];
  sharedModules: string[];
  keyDecisions: string[];
}

export interface TargetStructure {
  isMonorepo: boolean;
  treeDescription: string;
  fileMapping: FileMapping[];
  explanation?: string;
}

export interface ConversionResult {
  engine?: 'gemini-3.8-flash' | 'ast-deterministic';
  latencyMs?: number;
  projectAnalysis: ProjectAnalysis;
  recommendedTargetStructure: TargetStructure;
  convertedFiles: ConvertedFile[];
  dependencyUpdates: DependencyUpdates;
  migrationNotes: string[];
  convertedAt?: string;
  targetStack: TargetFrameworkStack;
}

export interface SampleProject {
  id: string;
  name: string;
  tagline: string;
  sourceStack: FrameworkStack;
  targetStack: TargetFrameworkStack;
  description: string;
  files: ProjectFile[];
}
