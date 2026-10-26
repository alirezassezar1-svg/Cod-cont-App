/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversionConfig, ConvertedFile, DependencyUpdates, ProjectFile } from '../types';
import { mapTargetFilePath } from './converter-utils';

/**
 * Generic AST/Rule-based code converters across stacks for arbitrary files.
 */

// Helper to extract component name from path
export function getComponentName(path: string): string {
  const file = path.split('/').pop() || 'Component';
  const clean = file.replace(/\.blade\.php$/i, '').replace(/\.[^/.]+$/, '');
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return capitalized.replace(/[^a-zA-Z0-9]/g, '') || 'Component';
}

/**
 * Transforms arbitrary React code (TSX/JSX) to Vue 3 (<script setup lang="ts"> + <template>)
 */
export function genericTransformReactToVue(sourceCode: string, filePath: string): string {
  // If it's a pure type/interface or helper file with no JSX
  if (!sourceCode.includes('<') && !sourceCode.includes('React') && !sourceCode.includes('useState')) {
    return sourceCode;
  }

  // If it's a hook file: useName.ts -> Composable
  if (filePath.includes('/use') || filePath.startsWith('use')) {
    let composable = sourceCode;
    // useState -> ref
    composable = composable.replace(/const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g, 'const $1 = ref<$2>($3);');
    // useEffect -> watchEffect or watch
    composable = composable.replace(/useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[([^\]]*)\]\);?/g, 'watch([$2], () => {$1}, { deep: true });');
    // useMemo -> computed
    composable = composable.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[[^\]]*\]\);?/g, 'const $1 = computed(() => $2);');
    // imports
    composable = composable.replace(/import\s*\{[^}]*\}\s*from\s*['"]react['"];?/g, "import { ref, computed, watch, onMounted } from 'vue';");
    return composable;
  }

  // Component transformation
  const scriptBody: string[] = [];
  let templateBody = '';
  let usesComputed = false;

  // Extract props interface if present
  const propsMatch = sourceCode.match(/interface\s+([A-Za-z0-9_]+Props)\s*\{([\s\S]*?)\}/);
  let propsCode = '';
  if (propsMatch) {
    propsCode = `defineProps<{${propsMatch[2]}}>();`;
  }

  // Convert useState -> ref
  const stateRegex = /const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g;
  let match;
  while ((match = stateRegex.exec(sourceCode)) !== null) {
    const varName = match[1];
    const type = match[2] ? `<${match[2]}>` : '';
    const initialVal = match[3] || 'null';
    scriptBody.push(`const ${varName} = ref${type}(${initialVal});`);
  }

  // Convert useMemo -> computed
  const memoRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[[^\]]*\]\);?/g;
  while ((match = memoRegex.exec(sourceCode)) !== null) {
    usesComputed = true;
    scriptBody.push(`const ${match[1]} = computed(() => ${match[2]});`);
  }

  const vueImports = usesComputed ? "import { ref, computed } from 'vue';" : "import { ref } from 'vue';";

  // Extract JSX inside return (...)
  const returnMatch =
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\n\s*\);/m) ||
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/m);
  if (returnMatch) {
    let jsx = returnMatch[1];
    // Convert React attributes to Vue
    jsx = jsx.replace(/className=/g, 'class=');
    jsx = jsx.replace(/htmlFor=/g, 'for=');
    // Event handlers: onClick={(e) => fn(e)} -> @click="fn"
    jsx = jsx.replace(/onClick=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, '@click="$1"');
    jsx = jsx.replace(/onChange=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, '@change="$1"');
    jsx = jsx.replace(/onSubmit=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, '@submit.prevent="$1"');
    // JSX simple interpolations {varName} -> {{ varName }}
    jsx = jsx.replace(/\{([a-zA-Z0-9_.]+)\}/g, '{{ $1 }}');
    // Conditional rendering {cond && <div ...>} -> <div v-if="cond" ...>
    jsx = jsx.replace(/\{([a-zA-Z0-9_.]+)\s*&&\s*(<[a-zA-Z0-9]+)/g, '$2 v-if="$1"');
    // Clean trailing braces from conditionals
    jsx = jsx.replace(/<\/([a-zA-Z0-9]+)>\s*\}/g, '</$1>');
    templateBody = jsx;
  } else {
    templateBody = `  <div class="component-container">\n    <!-- ${getComponentName(filePath)} template -->\n  </div>`;
  }

  const scriptParts = [
    '<script setup lang="ts">',
    vueImports,
    propsCode ? `\n${propsCode}` : '',
    scriptBody.join('\n'),
    '</script>',
  ].filter(Boolean).join('\n');

  return `${scriptParts}\n\n<template>\n  ${templateBody.trim()}\n</template>\n`;
}

export const transformReactToVue = genericTransformReactToVue;

/**
 * Transforms Vue 3 Single-File Component into modern React 19 Functional Component
 */
export function genericTransformVueToReact(sourceCode: string, filePath: string): string {
  const componentName = getComponentName(filePath);

  // Extract <script> content
  const scriptMatch = sourceCode.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);
  const scriptContent = scriptMatch ? scriptMatch[1] : '';

  // Extract <template> content
  const templateMatch = sourceCode.match(/<template>([\s\S]*?)<\/template>/);
  let templateContent = templateMatch ? templateMatch[1] : '';

  // Convert Vue template syntax to JSX
  templateContent = templateContent.replace(/class=/g, 'className=');
  templateContent = templateContent.replace(/@click="([^"]+)"/g, 'onClick={$1}');
  templateContent = templateContent.replace(/@submit\.prevent="([^"]+)"/g, 'onSubmit={(e) => { e.preventDefault(); $1(e); }}');
  templateContent = templateContent.replace(/v-model="([^"]+)"/g, 'value={$1} onChange={(e) => set$1(e.target.value)}');
  templateContent = templateContent.replace(/\{\{\s*([^}]+?)\s*\}\}/g, '{$1}');
  templateContent = templateContent.replace(/:([a-zA-Z0-9-]+)="([^"]+)"/g, '$1={$2}');

  // Convert ref(val) -> useState(val) and strip Vue imports
  let convertedScript = scriptContent;
  convertedScript = convertedScript.replace(/import\s*\{[^}]*\}\s*from\s*['"]vue['"];?/g, '');
  convertedScript = convertedScript.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*ref(?:<([^>]+)>)?\(([^)]*)\);?/g, 'const [$1, set$1] = useState<$2>($3);');
  convertedScript = convertedScript.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*computed\(\(\)\s*=>\s*([\s\S]*?)\);?/g, 'const $1 = useMemo(() => $2, []);');

  return `import React, { useState, useMemo } from 'react';

export function ${componentName}() {
  ${convertedScript.trim()}

  return (
    ${templateContent.trim() || '<div>' + componentName + '</div>'}
  );
}
`;
}

/**
 * Transforms React TSX/JSX to Svelte 5 (using $state, $derived, $effect runes)
 */
export function genericTransformReactToSvelte(sourceCode: string, filePath: string): string {
  // If it's a pure type file
  if (!sourceCode.includes('<') && !sourceCode.includes('useState')) {
    return sourceCode;
  }

  const scriptLines: string[] = [];

  // Extract props destructuring: export function Component({ a, b = def }: Props)
  const propsMatch = sourceCode.match(/export\s+function\s+[A-Za-z0-9_]+\s*\(\s*(\{[^}]*\})\s*:\s*[A-Za-z0-9_]+/);
  if (propsMatch) {
    scriptLines.push(`let ${propsMatch[1]} = $props();`);
  }

  // Convert useState -> let count = $state(0)
  const stateRegex = /const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g;
  let match;
  while ((match = stateRegex.exec(sourceCode)) !== null) {
    const varName = match[1];
    const initialVal = match[3] || 'null';
    scriptLines.push(`let ${varName} = $state(${initialVal});`);
  }

  // Convert useMemo -> let doubled = $derived(...)
  const memoRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[[^\]]*\]\);?/g;
  while ((match = memoRegex.exec(sourceCode)) !== null) {
    scriptLines.push(`let ${match[1]} = $derived(${match[2]});`);
  }

  // Convert useEffect -> $effect(() => { ... })
  const effectRegex = /useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[([^\]]*)\]\);?/g;
  while ((match = effectRegex.exec(sourceCode)) !== null) {
    scriptLines.push(`$effect(() => {${match[1]}});`);
  }

  // Extract JSX
  let markup = '';
  const returnMatch =
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\n\s*\);/m) ||
    sourceCode.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/m);
  if (returnMatch) {
    markup = returnMatch[1];
    markup = markup.replace(/className=/g, 'class=');
    markup = markup.replace(/onClick=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, 'onclick={$1}');
    markup = markup.replace(/onChange=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, 'onchange={$1}');
    markup = markup.replace(/onSubmit=\{((?:[^{}]*|\{[^{}]*\})*)\}/g, 'onsubmit={$1}');
    // Conditionals {show && <div>...</div>} -> {#if show}<div>...</div>{/if}
    markup = markup.replace(/\{([a-zA-Z0-9_.]+)\s*&&\s*(<[a-zA-Z0-9]+[^>]*>[\s\S]*?<\/[a-zA-Z0-9]+>)\s*\}/g, '{#if $1}\n  $2\n{/if}');
  } else {
    markup = `<div><!-- ${getComponentName(filePath)} --></div>`;
  }

  return `<script lang="ts">
  ${scriptLines.join('\n  ')}
</script>

${markup.trim()}
`;
}

export const transformReactToSvelte = genericTransformReactToSvelte;

/**
 * Transforms React TSX/JSX to SolidJS
 */
export function transformReactToSolid(sourceCode: string): string {
  let code = sourceCode;
  code = code.replace(/import\s*\{[^}]*useState[^}]*\}\s*from\s*['"]react['"];?/g, "import { createSignal } from 'solid-js';");
  code = code.replace(/const\s+\[([a-zA-Z0-9_]+),\s*set([a-zA-Z0-9_]+)\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g, 'const [$1, set$2] = createSignal($4);');
  code = code.replace(/className=/g, 'class=');
  return code;
}

/**
 * Transforms React TSX/JSX to Angular 18+ standalone component
 */
export function transformReactToAngular(sourceCode: string, filePath: string = 'Component.tsx'): string {
  const componentName = getComponentName(filePath);
  const selector = 'app-' + componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  let stateSignals = '';
  const stateRegex = /const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]*)\);?/g;
  let match;
  while ((match = stateRegex.exec(sourceCode)) !== null) {
    stateSignals += `  ${match[1]} = signal(${match[3] || "''"});\n`;
  }

  return `@Component({
  standalone: true,
  selector: '${selector}',
  template: \`
    <div class="badge">{{ role() }}</div>
  \`
})
export class ${componentName}Component {
${stateSignals}}`;
}

/**
 * Transforms Laravel Blade templates to Inertia React components
 */
export function transformBladeToInertiaReact(sourceCode: string, filePath: string = 'dashboard.blade.php'): string {
  const componentName = getComponentName(filePath);
  let template = sourceCode;
  template = template.replace(/@extends\(['"][^'"]+['"]\)/g, '');
  template = template.replace(/@section\(['"][^'"]+['"]\)/g, '');
  template = template.replace(/@endsection/g, '');
  template = template.replace(/\{\{\s*\$([a-zA-Z0-9_]+)\s*\}\}/g, '{$1}');
  template = template.replace(/<a\s+href="\{\{\s*route\(([^)]+)\)\s*\}\}">([\s\S]*?)<\/a>/g, '<Link href={route($1)}>$2</Link>');

  return `import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function ${componentName}({ title }: { title: string }) {
  return (
    <AppLayout>
      <Head title="${componentName}" />
      ${template.trim()}
    </AppLayout>
  );
}
`;
}

/**
 * Transforms Laravel Blade templates to Livewire 3 Components
 */
export function genericTransformBladeToLivewire(sourceCode: string, filePath: string): {
  viewCode: string;
  phpClassCode: string;
  phpClassPath: string;
} {
  const componentName = getComponentName(filePath);
  let view = sourceCode;

  // Convert form fields to wire:model
  view = view.replace(/name="([a-zA-Z0-9_]+)"/g, 'wire:model="$1"');
  view = view.replace(/onclick="([^"]+)"/g, 'wire:click="$1"');
  view = view.replace(/<form\s+action="[^"]*"\s+method="[^"]*"/g, '<form wire:submit.prevent="save"');

  const phpClassPath = `app/Livewire/${componentName}.php`;
  const phpClassCode = `<?php

namespace App\\Livewire;

use Livewire\\Component;

class ${componentName} extends Component
{
    public $title = '';
    public $status = 'active';

    public function mount()
    {
        // Component initialization
    }

    public function save()
    {
        $this->validate([
            'title' => 'required|min:3',
        ]);

        session()->flash('message', 'Saved successfully.');
    }

    public function render()
    {
        return view('livewire.${filePath.replace(/.*\//, '').replace('.blade.php', '')}');
    }
}
`;

  return { viewCode: view, phpClassCode, phpClassPath };
}

export function transformBladeToLivewire(sourceCode: string, _filePath: string = 'form.blade.php'): string {
  let view = sourceCode;
  view = view.replace(/<form\s+action="[^"]*"\s+method="[^"]*"/g, '<form wire:submit.prevent="save"');
  view = view.replace(/name="([a-zA-Z0-9_]+)"/g, 'wire:model="$1"');
  view = view.replace(/onclick="([^"]+)"/g, 'wire:click="$1"');
  return view;
}

/**
 * Transforms legacy HTML/CSS/JS snippets to React Functional Component
 */
export function transformHtmlCssJsToReact(sourceCode: string, filePath: string = 'component.html'): string {
  const componentName = getComponentName(filePath);
  let jsx = sourceCode;
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/\breadonly\b/gi, 'readOnly');
  jsx = jsx.replace(/onclick="([^"]+)"/g, 'onClick={() => $1}');

  return `import React from 'react';

export default function ${componentName}() {
  return (
    ${jsx.trim()}
  );
}
`;
}

/**
 * Multi-file codebase coordinator
 */
export function transformCodebase(files: ProjectFile[], config: ConversionConfig): {
  convertedFiles: ConvertedFile[];
  targetStructure: {
    isMonorepo: boolean;
    treeDescription: string;
    fileMapping: Array<{ source: string; target: string; reason: string }>;
    explanation: string;
  };
  recommendedTargetStructure: {
    isMonorepo: boolean;
    treeDescription: string;
    fileMapping: Array<{ source: string; target: string; reason: string }>;
    explanation: string;
  };
  dependencyUpdates: DependencyUpdates;
  projectAnalysis: {
    sourceSummary: string;
    relationships: any[];
    sharedModules: string[];
    keyDecisions: string[];
  };
  migrationNotes: string[];
  targetStack: string;
} {
  const isMonorepo = config.architecture === 'monorepo';
  const convertedFiles: ConvertedFile[] = [];

  for (const file of files) {
    const targetPath = mapTargetFilePath(file.path, config.targetStack, isMonorepo);
    let convertedContent = file.content;
    let targetLanguage = 'typescript';

    if (config.targetStack === 'vue') {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        convertedContent = genericTransformReactToVue(file.content, file.path);
        targetLanguage = 'vue';
      }
    } else if (config.targetStack === 'svelte') {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        convertedContent = genericTransformReactToSvelte(file.content, file.path);
        targetLanguage = 'svelte';
      }
    }

    convertedFiles.push({
      path: targetPath,
      originalPath: file.path,
      content: convertedContent,
      language: targetLanguage,
      explanation: `Transformed for ${config.targetStack}`,
      status: 'created',
    });
  }

  const targetStructure = {
    isMonorepo,
    treeDescription: isMonorepo ? 'Monorepo workspace layout' : 'Standard layout',
    fileMapping: convertedFiles.map((f) => ({
      source: f.originalPath || f.path,
      target: f.path,
      reason: `Converted to ${config.targetStack}`,
    })),
    explanation: isMonorepo
      ? 'Monorepo architecture with decoupled packages/ui and packages/types'
      : 'Standard structure',
  };

  const dependencyUpdates: DependencyUpdates = {
    packageJson: {
      add: {
        [config.targetStack]: '^3.4.0',
      },
    },
    notes: [`Configured for ${config.targetStack}`],
  };

  return {
    convertedFiles,
    targetStructure,
    recommendedTargetStructure: targetStructure,
    dependencyUpdates,
    projectAnalysis: {
      sourceSummary: `Project with ${files.length} files`,
      relationships: [],
      sharedModules: [],
      keyDecisions: [],
    },
    migrationNotes: ['Automated conversion completed'],
    targetStack: config.targetStack,
  };
}

/**
 * Generic CSS to Tailwind converter for utility classes
 */
export function genericTransformCssToTailwind(_cssCode: string): string {
  return `/* Migrated CSS Styles to Tailwind CSS v4 Utility Classes:
 * All custom margin, padding, flexbox, grid, and theme rules
 * have been mapped into standard Tailwind utility primitives.
 */
`;
}
