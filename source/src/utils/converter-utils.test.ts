/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  buildFolderTree,
  computeDiff,
  mapTargetFilePath,
  analyzeProjectFiles,
  generateDeterministicConversion,
} from './converter-utils';
import { SAMPLE_PROJECTS } from './sample-projects';

describe('converter-utils', () => {
  it('detectLanguage identifies correct file extensions', () => {
    expect(detectLanguage('src/App.tsx')).toBe('typescript');
    expect(detectLanguage('src/App.vue')).toBe('vue');
    expect(detectLanguage('src/App.svelte')).toBe('svelte');
    expect(detectLanguage('src/styles/app.css')).toBe('css');
    expect(detectLanguage('package.json')).toBe('json');
    expect(detectLanguage('resources/views/app.blade.php')).toBe('html');
  });

  it('buildFolderTree builds nested tree hierarchy properly', () => {
    const files = [
      { path: 'src/types/cart.ts', id: '1' },
      { path: 'src/components/ProductCard.tsx', id: '2' },
      { path: 'src/App.tsx', id: '3' },
    ];

    const tree = buildFolderTree(files);
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('src');
    expect(tree[0].isFolder).toBe(true);

    const srcChildren = tree[0].children!;
    expect(srcChildren.length).toBeGreaterThanOrEqual(3);
    const typesFolder = srcChildren.find((n) => n.name === 'types');
    expect(typesFolder?.isFolder).toBe(true);
    expect(typesFolder?.children?.[0].name).toBe('cart.ts');
  });

  it('computeDiff accurately identifies additions, deletions, and common lines', () => {
    const oldCode = 'line 1\nline 2\nline 3';
    const newCode = 'line 1\nline 2 modified\nline 3\nline 4';

    const diff = computeDiff(oldCode, newCode);
    expect(diff.length).toBeGreaterThanOrEqual(3);

    const commonFirstLine = diff.find((d) => d.text === 'line 1');
    expect(commonFirstLine?.type).toBe('same');

    const addedLine4 = diff.find((d) => d.text === 'line 4');
    expect(addedLine4?.type).toBe('add');
  });

  it('mapTargetFilePath correctly converts extensions and monorepo structure', () => {
    // Standard React to Vue
    expect(mapTargetFilePath('src/components/Button.tsx', 'vue', false)).toBe(
      'src/components/Button.vue'
    );

    // Monorepo React to Vue
    expect(mapTargetFilePath('src/components/Button.tsx', 'vue', true)).toBe(
      'packages/ui/components/Button.vue'
    );
    expect(mapTargetFilePath('src/types/user.ts', 'vue', true)).toBe(
      'packages/types/user.ts'
    );
  });

  it('analyzeProjectFiles extracts inter-file imports and shared modules', () => {
    const sample = SAMPLE_PROJECTS[0]; // React cart
    const analysis = analyzeProjectFiles(sample.files);

    expect(analysis.relationships.length).toBeGreaterThan(0);
    expect(analysis.sharedModules.length).toBeGreaterThan(0);

    // CartContext should consume cart.ts and useLocalStorage
    const contextRel = analysis.relationships.filter((r) => r.from.includes('CartContext'));
    expect(contextRel.length).toBeGreaterThanOrEqual(1);
  });

  it('generateDeterministicConversion handles React Cart to Vue 3 Pinia conversion', () => {
    const sample = SAMPLE_PROJECTS[0];
    const result = generateDeterministicConversion(sample.files, {
      sourceStack: 'react',
      targetStack: 'vue',
      useTypeScript: true,
      architecture: 'standard',
      preserveComments: true,
      stateStrategy: 'pinia',
    });

    expect(result.convertedFiles).toHaveLength(5);
    expect(result.projectAnalysis.keyDecisions.length).toBeGreaterThanOrEqual(3);
    expect(result.dependencyUpdates.packageJson?.add?.['pinia']).toBeDefined();
    expect(result.dependencyUpdates.packageJson?.remove).toContain('react');

    // Ensure converted files contain Vue SFC syntax
    const productCardVue = result.convertedFiles.find((f) => f.path.includes('ProductCard.vue'));
    expect(productCardVue).toBeDefined();
    expect(productCardVue?.content).toContain('<script setup lang="ts">');
    expect(productCardVue?.content).toContain('defineProps');
  });

  it('generateDeterministicConversion handles Laravel Blade to Inertia React', () => {
    const sample = SAMPLE_PROJECTS[2]; // Laravel blade
    const result = generateDeterministicConversion(sample.files, {
      sourceStack: 'laravel-blade',
      targetStack: 'laravel-inertia-react',
      useTypeScript: true,
      architecture: 'standard',
      preserveComments: true,
      stateStrategy: 'auto',
    });

    expect(result.convertedFiles).toHaveLength(4);
    const inertiaPage = result.convertedFiles.find((f) => f.path.includes('Dashboard.tsx'));
    expect(inertiaPage).toBeDefined();
    expect(inertiaPage?.content).toContain('AppLayout');
    expect(result.dependencyUpdates.composerJson?.add?.['inertiajs/inertia-laravel']).toBeDefined();
  });

  it('generic transformer converts arbitrary custom React component to Vue 3', () => {
    const customFiles = [
      {
        id: 'custom1',
        path: 'src/components/MetricCounter.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export function MetricCounter() {
  const [count, setCount] = useState<number>(0);
  return (
    <div className="p-4 bg-slate-900">
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <span>{count}</span>
    </div>
  );
}`,
      },
    ];

    const result = generateDeterministicConversion(customFiles, {
      sourceStack: 'react',
      targetStack: 'vue',
      useTypeScript: true,
      architecture: 'standard',
      preserveComments: true,
      stateStrategy: 'auto',
    });

    expect(result.convertedFiles).toHaveLength(1);
    const converted = result.convertedFiles[0];
    expect(converted.path).toBe('src/components/MetricCounter.vue');
    expect(converted.content).toContain('<script setup lang="ts">');
    expect(converted.content).toContain('ref<number>(0)');
    expect(converted.content).toContain('<template>');
    expect(converted.content).toContain('class="p-4 bg-slate-900"');
  });

  it('generic transformer converts Laravel Blade to Livewire 3 with PHP class', () => {
    const customBlade = [
      {
        id: 'blade1',
        path: 'resources/views/newsletter.blade.php',
        language: 'html',
        content: `<form action="/newsletter" method="POST">
  <input type="email" name="email" />
  <button type="submit">Subscribe</button>
</form>`,
      },
    ];

    const result = generateDeterministicConversion(customBlade, {
      sourceStack: 'laravel-blade',
      targetStack: 'livewire',
      useTypeScript: false,
      architecture: 'standard',
      preserveComments: true,
      stateStrategy: 'auto',
    });

    expect(result.convertedFiles.length).toBeGreaterThanOrEqual(2);
    const viewFile = result.convertedFiles.find((f) => f.path.endsWith('.blade.php'));
    const phpClass = result.convertedFiles.find(
      (f) => f.path.endsWith('.php') && !f.path.includes('.blade.')
    );

    expect(viewFile).toBeDefined();
    expect(viewFile?.content).toContain('wire:model="email"');
    expect(phpClass).toBeDefined();
    expect(phpClass?.content).toContain('class Newsletter extends Component');
  });
});
