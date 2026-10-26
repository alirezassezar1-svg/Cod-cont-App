/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FrameworkStack,
  TargetFrameworkStack,
  ConversionConfig,
} from '../types';
import { ArrowRight, Layers, Cpu, Sparkles } from 'lucide-react';

interface StackConfigBarProps {
  config: ConversionConfig;
  onChangeConfig: (newConfig: Partial<ConversionConfig>) => void;
  onSelectSample: (sampleId: string) => void;
  selectedSampleId?: string;
}

const SOURCE_OPTIONS: Array<{ value: FrameworkStack; label: string }> = [
  { value: 'react', label: 'React (TSX / Hooks)' },
  { value: 'vue', label: 'Vue 3 (Composition / Pinia)' },
  { value: 'svelte', label: 'Svelte 5 (Runes)' },
  { value: 'angular', label: 'Angular 19 (Signals)' },
  { value: 'solid', label: 'Solid.js' },
  { value: 'laravel-blade', label: 'Laravel Blade' },
  { value: 'class-components', label: 'React Class Components' },
  { value: 'css', label: 'Vanilla CSS / BEM' },
];

const TARGET_OPTIONS: Array<{ value: TargetFrameworkStack; label: string }> = [
  { value: 'vue', label: 'Vue 3 (<script setup> + Pinia)' },
  { value: 'react', label: 'React 19 (Functional + Hooks)' },
  { value: 'svelte', label: 'Svelte 5 ($state runes)' },
  { value: 'angular', label: 'Angular 19 (Standalone Signals)' },
  { value: 'solid', label: 'Solid.js' },
  { value: 'laravel-inertia-react', label: 'Laravel + Inertia.js (React)' },
  { value: 'laravel-inertia-vue', label: 'Laravel + Inertia.js (Vue)' },
  { value: 'livewire', label: 'Livewire 3 (Full-Stack Component)' },
  { value: 'tailwind', label: 'Tailwind CSS v4' },
];

export const StackConfigBar: React.FC<StackConfigBarProps> = ({
  config,
  onChangeConfig,
  onSelectSample,
  selectedSampleId,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
      {/* Framework Stack Selectors */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Source:</span>
          <select
            value={config.sourceStack}
            onChange={(e) => onChangeConfig({ sourceStack: e.target.value as FrameworkStack })}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 font-medium"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Target:</span>
          <select
            value={config.targetStack}
            onChange={(e) => onChangeConfig({ targetStack: e.target.value as TargetFrameworkStack })}
            className="bg-slate-950 border border-sky-800/80 text-sky-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-sky-400 font-medium"
          >
            {TARGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block mx-1" />

        {/* Architecture Mode Selector */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Layout:</span>
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeConfig({ architecture: 'standard' })}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                config.architecture === 'standard'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ architecture: 'monorepo' })}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                config.architecture === 'monorepo'
                  ? 'bg-sky-950 text-sky-300 font-medium border border-sky-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monorepo (Turborepo)
            </button>
          </div>
        </div>

        {/* TypeScript Toggle */}
        <div className="flex items-center gap-1.5 ml-1">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => onChangeConfig({ useTypeScript: !config.useTypeScript })}
            className={`px-2 py-0.5 rounded border text-xs font-mono font-medium transition-colors ${
              config.useTypeScript
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            {config.useTypeScript ? 'TypeScript (Strict)' : 'JavaScript (ES2024)'}
          </button>
        </div>
      </div>

      {/* Preset Real-World Projects */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-slate-400">Load Template:</span>
        <select
          value={selectedSampleId || ''}
          onChange={(e) => {
            if (e.target.value) onSelectSample(e.target.value);
          }}
          className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400 font-medium"
        >
          <option value="" disabled>
            Choose a multi-file project...
          </option>
          <option value="react-cart-auth">React TS Shopping Cart & Auth (5 files)</option>
          <option value="vue-pinia-tasks">Vue 3 Pinia Task Manager (4 files)</option>
          <option value="react-to-svelte5">React TS to Svelte 5 Runes (3 files)</option>
          <option value="laravel-blade-dashboard">Laravel Blade to Inertia.js (4 files)</option>
          <option value="blade-to-livewire">Laravel Blade to Livewire 3 (2 files)</option>
          <option value="react-class-legacy">Legacy Class Components (3 files)</option>
          <option value="css-to-tailwind">CSS to Tailwind CSS v4 (3 files)</option>
        </select>
      </div>
    </div>
  );
};
