import { describe, it, expect } from 'vitest';
import {
  transformReactToVue,
  transformReactToSvelte,
  transformReactToSolid,
  transformReactToAngular,
  transformBladeToInertiaReact,
  transformBladeToLivewire,
  transformHtmlCssJsToReact,
  transformCodebase,
} from './generic-transformers';
import { ProjectFile } from '../types';

describe('generic-transformers', () => {
  describe('transformReactToVue', () => {
    it('converts useState to Vue 3 ref and updates JSX bindings', () => {
      const reactCode = `import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState<number>(0);
  return (
    <div className="p-4 flex gap-2">
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <span className="font-bold">{count}</span>
    </div>
  );
}`;
      const vueSfc = transformReactToVue(reactCode, 'Counter.tsx');
      expect(vueSfc).toContain('<script setup lang="ts">');
      expect(vueSfc).toContain("import { ref } from 'vue';");
      expect(vueSfc).toContain('const count = ref<number>(0);');
      expect(vueSfc).toContain('<template>');
      expect(vueSfc).toContain('class="p-4 flex gap-2"');
      expect(vueSfc).toContain('@click="() => setCount(count + 1)"');
      expect(vueSfc).toContain('{{ count }}');
    });

    it('converts React props to defineProps', () => {
      const reactCode = `interface CardProps {
  title: string;
  price: number;
}
export function ProductCard({ title, price }: CardProps) {
  return <div className="card"><h3>{title}</h3><span>{price}</span></div>;
}`;
      const vueSfc = transformReactToVue(reactCode, 'ProductCard.tsx');
      expect(vueSfc).toContain('defineProps<{');
      expect(vueSfc).toContain('title: string;');
      expect(vueSfc).toContain('price: number;');
    });
  });

  describe('transformReactToSvelte', () => {
    it('converts React state to Svelte 5 runes ($state, $props, onclick)', () => {
      const reactCode = `import { useState } from 'react';
interface ToggleProps { initial?: boolean }
export function Toggle({ initial = false }: ToggleProps) {
  const [active, setActive] = useState(initial);
  return (
    <button className="toggle-btn" onClick={() => setActive(!active)}>
      {active ? 'ON' : 'OFF'}
    </button>
  );
}`;
      const svelteCode = transformReactToSvelte(reactCode, 'Toggle.tsx');
      expect(svelteCode).toContain('<script lang="ts">');
      expect(svelteCode).toContain('let active = $state(initial);');
      expect(svelteCode).toContain('let { initial = false } = $props();');
      expect(svelteCode).toContain('class="toggle-btn"');
      expect(svelteCode).toContain('onclick=');
    });
  });

  describe('transformReactToSolid', () => {
    it('converts React useState to Solid createSignal and replaces className', () => {
      const reactCode = `import { useState } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  return <div className="counter-box">{count}</div>;
}`;
      const solidCode = transformReactToSolid(reactCode);
      expect(solidCode).toContain("import { createSignal } from 'solid-js';");
      expect(solidCode).toContain('const [count, setCount] = createSignal(0);');
      expect(solidCode).toContain('class="counter-box"');
    });
  });

  describe('transformReactToAngular', () => {
    it('generates an Angular standalone component with signal state', () => {
      const reactCode = `import { useState } from 'react';
export function UserBadge() {
  const [role, setRole] = useState('Admin');
  return <div className="badge">{role}</div>;
}`;
      const angularCode = transformReactToAngular(reactCode, 'UserBadge.tsx');
      expect(angularCode).toContain("@Component({");
      expect(angularCode).toContain("standalone: true");
      expect(angularCode).toContain("selector: 'app-user-badge'");
      expect(angularCode).toContain("role = signal('Admin');");
    });
  });

  describe('transformBladeToInertiaReact', () => {
    it('converts Blade templates to Inertia React components with Link and Head', () => {
      const bladeCode = `@extends('layouts.app')
@section('content')
<div class="container">
  <h1>{{ $title }}</h1>
  <a href="{{ route('profile') }}">Profile</a>
</div>
@endsection`;
      const inertiaCode = transformBladeToInertiaReact(bladeCode, 'dashboard.blade.php');
      expect(inertiaCode).toContain("import { Head, Link } from '@inertiajs/react';");
      expect(inertiaCode).toContain("import AppLayout from '@/Layouts/AppLayout';");
      expect(inertiaCode).toContain('<AppLayout>');
      expect(inertiaCode).toContain('{title}');
      expect(inertiaCode).toContain('<Link href={route');
    });
  });

  describe('transformBladeToLivewire', () => {
    it('converts Blade form to Livewire 3 component with wire directives', () => {
      const bladeCode = `<form action="/subscribe" method="POST">
  <input type="email" name="user_email" />
  <button type="submit">Submit</button>
</form>`;
      const livewireCode = transformBladeToLivewire(bladeCode);
      expect(livewireCode).toContain('wire:submit.prevent=');
      expect(livewireCode).toContain('wire:model="user_email"');
    });
  });

  describe('transformHtmlCssJsToReact', () => {
    it('converts HTML document to React TypeScript component', () => {
      const htmlCode = `<div class="hero" onclick="doSomething()">
  <h1>Welcome</h1>
  <input type="text" readonly />
</div>`;
      const reactCode = transformHtmlCssJsToReact(htmlCode, 'hero.html');
      expect(reactCode).toContain("import React from 'react';");
      expect(reactCode).toContain('className="hero"');
      expect(reactCode).toContain('readOnly');
      expect(reactCode).toContain('export default function Hero()');
    });
  });

  describe('transformCodebase multi-file coordinator', () => {
    it('correctly maps file paths, rewrites imports, and creates structure proposals', () => {
      const inputFiles: ProjectFile[] = [
        {
          id: '1',
          path: 'src/types/user.ts',
          content: 'export interface User { id: string; name: string; }',
          language: 'typescript',
        },
        {
          id: '2',
          path: 'src/components/UserCard.tsx',
          content: `import { User } from '../types/user';
export function UserCard({ user }: { user: User }) {
  return <div className="card">{user.name}</div>;
}`,
          language: 'typescript',
        },
      ];

      const result = transformCodebase(inputFiles, {
        sourceStack: 'react',
        targetStack: 'vue',
        useTypeScript: true,
        architecture: 'monorepo',
        preserveComments: true,
        stateStrategy: 'pinia',
      });

      expect(result.convertedFiles).toHaveLength(2);
      const userCardVue = result.convertedFiles.find((f) => f.path.includes('UserCard.vue'));
      expect(userCardVue).toBeDefined();
      expect(userCardVue?.path).toContain('packages/ui/components/UserCard.vue');
      expect(result.targetStructure.explanation).toContain('Monorepo');
      expect(result.dependencyUpdates.packageJson?.add?.['vue']).toBeDefined();
    });
  });
});
