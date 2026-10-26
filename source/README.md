# Code Converter Pro v4.0 (Multi-File Edition)

> An elite principal-engineering multi-file framework migration and codebase transformation workbench. Converts entire multi-file architectures with cross-module import reconciliation, state pattern translation, and monorepo restructuring.

---

## Overview

Modern web projects are rarely single files. They span custom hooks, global reactive stores, typed schemas, layouts, server endpoints, and components. **Code Converter Pro v4.0** is designed specifically to migrate **entire multi-file codebases** between major frontend and full-stack frameworks with AST awareness, idiomatic best practices, and zero loss of business logic.

---

## Supported Stacks Matrix

| Source Stack | Supported Target Stacks | State & Architecture Strategy |
| :--- | :--- | :--- |
| **React (TSX / Hooks)** | Vue 3, Svelte 5, Angular 19, Solid, Inertia.js | React Context / Hooks $\to$ Pinia, Svelte Runes, Signals |
| **Vue 3 (Composition / Pinia)** | React 19, Svelte 5, Solid.js | Pinia Setup Stores $\to$ React 19 Custom Hooks / Zustand |
| **Svelte 5 (Runes)** | React 19, Vue 3 | `$state`, `$derived`, `$effect` $\to$ `useState`, `useMemo`, `useEffect` |
| **Laravel Blade** | React + Inertia.js, Vue + Inertia.js, Livewire 3 | Blade monolith views $\to$ Inertia `<AppLayout>` & Pages / Livewire |
| **React Class Components** | React 19 Functional + Hooks | Lifecycle methods (`componentDidMount`, etc.) $\to$ `useEffect` |
| **Vanilla CSS / BEM** | Tailwind CSS v4 | CSS stylesheets $\to$ inline production Tailwind utility classes |

---

## Core Capabilities

### 1. Inter-File Relationship Analysis
- Automatically detects and diagrams module relationships (`imports`, `uses-hook`, `uses-store`, `types`, `renders`).
- Tracks cross-file dependencies and shared utilities.
- Generates an architectural summary and logs key migration decisions.

### 2. Monorepo & Standard Target Restructuring
- **Standard Mode**: Reorganizes files according to target framework conventions (e.g. `src/stores`, `src/composables`, `src/components`).
- **Monorepo Mode (Turborepo / Nx / pnpm)**: Restructures the project into isolated packages:
  - `apps/web`: Root application shell and pages.
  - `packages/ui`: Framework components and design system primitives.
  - `packages/shared`: Reactive stores, composables, and business logic.
  - `packages/types`: Core domain interfaces and schemas.

### 3. Syntax-Highlighted Diff Studio
- Powered by PrismJS syntax highlighting with high-contrast Studio Dark theme.
- Side-by-side split view and unified diff mode.
- Line additions in emerald green, removals in rose red, with line numbers for both source and target files.
- Per-file transformation rationale cards explaining what changed and why.

### 4. Dependency & Migration Checklist
- Identifies npm packages to add and deprecated packages to remove.
- Generates PHP / Composer dependencies for Laravel Inertia and Livewire.
- Provides one-click copyable terminal install commands.
- Lists framework-specific gotchas, lifecycle nuances, and gotchas.

### 5. Dual-Engine Architecture
- **Server-Side AI Engine**: Express server calling Gemini 3.8 Flash via `@google/genai` with strict structured JSON output.
- **Deterministic AST Engine**: Instant rule-based fallback providing high-fidelity transformations offline or with zero network latency.

### 6. Clean ZIP Export
- One-click export bundling all converted files in their recommended directory structure.
- Automatically bundles a markdown `MIGRATION_GUIDE.md` detailing architecture analysis, dependency updates, and gotchas.
- Strict path filtering ensures no temporary files, test screenshots, or hidden metadata are packaged.

---

## Project Structure

```
├── server.ts                   # Express full-stack server with Gemini 3.8 Flash API
├── src/
│   ├── App.tsx                 # Main workbench UI and state orchestration
│   ├── types.ts                # Domain interfaces for files, configs, and results
│   ├── components/
│   │   ├── Header.tsx          # Top bar with view navigation, engine badge, and CTA
│   │   ├── StackConfigBar.tsx  # Source/Target stack, layout, and template toolbar
│   │   ├── ProjectFileTree.tsx # Interactive source file explorer
│   │   ├── CodeEditor.tsx      # Syntax-highlighted code editor with line gutter
│   │   ├── DiffViewer.tsx      # Side-by-side & unified syntax diff viewer
│   │   ├── ProjectAnalysisView.tsx # Module graph & architectural decisions
│   │   ├── TargetStructureView.tsx # ASCII tree & monorepo mapping
│   │   ├── DependenciesView.tsx    # package.json/composer.json delta & gotchas
│   │   └── NewFileModal.tsx    # Modal for adding custom files to the project
│   └── utils/
│       ├── converter-utils.ts  # Diffing, tree hierarchy, and conversion engine
│       ├── generic-transformers.ts # AST-style regex transformers for all stacks
│       ├── syntax-highlighter.ts   # PrismJS multi-language syntax highlighter
│       └── sample-projects.ts  # Pre-loaded multi-file test suites
```

---

## Getting Started

### Development
```bash
npm install
npm run dev
```
The application will launch at `http://localhost:3000`.

## Testing Framework & Test Guide

The project is integrated with **Vitest**, **JSDOM**, and **React Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).

### Available Test Commands
```bash
# Run all unit and integration test suites once
npm test

# Run Vitest in interactive watch mode
npm run test:watch
```

### Test Directory Structure
```
├── vitest.config.ts                    # Vitest configuration with JSDOM and globals
├── src/
│   ├── test/
│   │   └── setup.ts                    # Test setup (jest-dom matchers, DOM cleanup)
│   ├── utils/
│   │   ├── converter-utils.test.ts     # Core tree, diff, and mapping algorithms
│   │   ├── generic-transformers.spec.ts# AST-style regex rules across stacks
│   │   └── syntax-highlighter.spec.ts  # PrismJS syntax highlighting tokens
│   ├── components/
│   │   ├── Header.spec.tsx             # Nav bar, tab switching, action buttons
│   │   ├── StackConfigBar.spec.tsx     # Framework dropdowns, monorepo layout toggle
│   │   ├── ProjectFileTree.spec.tsx    # Tree hierarchy, file selection, add/delete
│   │   ├── DiffViewer.spec.tsx         # Side-by-side & unified diff rendering, copy/download
│   │   ├── ProjectAnalysisView.spec.tsx# Architecture summary, relationships, decisions
│   │   ├── TargetStructureView.spec.tsx# ASCII tree & file relocation table
│   │   └── DependenciesView.spec.tsx   # package.json/composer.json diffs & gotchas
│   └── App.spec.tsx                    # Full-workbench integration & conversion lifecycle
```

### 1. Writing Unit Tests for Utility Functions
For pure functions (e.g. AST transformers, diff algorithms, or language parsers), place test files in `src/utils/*.spec.ts` using standard Vitest APIs (`describe`, `it`, `expect`):

```typescript
import { describe, it, expect } from 'vitest';
import { detectLanguage, computeDiff } from './converter-utils';

describe('converter-utils', () => {
  it('detects language from file path extension', () => {
    expect(detectLanguage('src/App.tsx')).toBe('typescript');
    expect(detectLanguage('src/App.vue')).toBe('vue');
  });

  it('accurately generates diff additions and deletions', () => {
    const diff = computeDiff('old line', 'new line');
    expect(diff.some((d) => d.type === 'add')).toBe(true);
  });
});
```

### 2. Writing Unit & Interaction Tests for Components
For React components, place test files alongside components in `src/components/*.spec.tsx`. Use `@testing-library/react` and `@testing-library/user-event`:

```typescript
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

describe('Header Component', () => {
  it('triggers onConvert callback when clicking the CTA button', async () => {
    const user = userEvent.setup();
    const onConvert = vi.fn();

    render(
      <Header
        onConvert={onConvert}
        isConverting={false}
        onExportZip={vi.fn()}
        hasConvertedResult={false}
        activeView="editor"
        setActiveView={vi.fn()}
        fileCount={3}
      />
    );

    const convertBtn = screen.getByRole('button', { name: /convert project/i });
    await user.click(convertBtn);
    expect(onConvert).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Writing End-to-End Integration Tests
For cross-component workflows (such as loading a template, running a conversion, and inspecting diffs), write integration tests in `src/App.spec.tsx`:

```typescript
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Integration', () => {
  it('loads sample project, converts codebase, and navigates tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click Convert Project
    const convertBtn = screen.getByRole('button', { name: /convert project/i });
    await user.click(convertBtn);

    // Wait for diff view to unlock
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /diff & converted/i })).not.toBeDisabled();
    });

    // Check that target diff is visible
    expect(screen.getByText('Transformation Rationale:')).toBeInTheDocument();
  });
});
```

---

## Production Build
```bash
npm run build
npm start
```

---

## License
Apache-2.0
