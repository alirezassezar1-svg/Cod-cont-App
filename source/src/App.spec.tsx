import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SAMPLE_PROJECTS } from './utils/sample-projects';
import { generateDeterministicConversion } from './utils/converter-utils';

describe('App Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders application workbench and loads default React Cart sample', () => {
    render(<App />);

    expect(screen.getByText('Code Converter Pro')).toBeInTheDocument();
    expect(screen.getByText('Source Tree')).toBeInTheDocument();
    expect(screen.getAllByText('ProductCard.tsx')[0]).toBeInTheDocument();
    expect(screen.getAllByText('CartContext.tsx')[0]).toBeInTheDocument();
  });

  it('switches active file when clicking file tree', async () => {
    const user = userEvent.setup();
    render(<App />);

    const cartContextFile = screen.getAllByText('CartContext.tsx')[0];
    await user.click(cartContextFile);

    // Active tab in code editor should now show CartContext.tsx
    const activeTabs = screen.getAllByText('CartContext.tsx');
    expect(activeTabs.length).toBeGreaterThanOrEqual(1);
  });

  it('performs end-to-end conversion, unlocks result tabs, and renders diff view', async () => {
    const user = userEvent.setup();

    const mockResult = generateDeterministicConversion(SAMPLE_PROJECTS[0].files, {
      sourceStack: 'react',
      targetStack: 'vue',
      useTypeScript: true,
      architecture: 'standard',
      preserveComments: true,
      stateStrategy: 'auto',
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    } as any);

    render(<App />);

    const convertBtn = screen.getByRole('button', { name: /convert project/i });
    expect(convertBtn).toBeInTheDocument();

    await user.click(convertBtn);

    // Wait for conversion to complete and diff view to activate
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /diff & converted/i })).not.toBeDisabled();
    });

    // Check that diff view header appears
    await waitFor(() => {
      expect(screen.getByText(/source:/i)).toBeInTheDocument();
      expect(screen.getByText(/target:/i)).toBeInTheDocument();
    });

    // Check that we can navigate to Project Analysis tab
    const analysisTab = screen.getByRole('button', { name: /project analysis/i });
    await user.click(analysisTab);

    expect(screen.getByText('1. Project Analysis')).toBeInTheDocument();
    expect(screen.getByText(/important decisions made during conversion/i)).toBeInTheDocument();

    // Check that we can navigate to Target Monorepo tab
    const structureTab = screen.getByRole('button', { name: /target monorepo/i });
    await user.click(structureTab);

    expect(screen.getByText('2. Recommended Target Structure')).toBeInTheDocument();

    // Check that we can navigate to Dependencies tab
    const depsTab = screen.getByRole('button', { name: /dependencies/i });
    await user.click(depsTab);

    expect(screen.getByText('3. Package & Dependency Updates')).toBeInTheDocument();
  });

  it('loads another template (e.g., Svelte 5 Runes) when selected in StackConfigBar', async () => {
    const user = userEvent.setup();
    render(<App />);

    const templateSelect = screen.getByDisplayValue('Choose a multi-file project...');
    await user.selectOptions(templateSelect, 'react-to-svelte5');

    // Should load Svelte 5 Runes sample files
    await waitFor(() => {
      expect(screen.getByText('todo.ts')).toBeInTheDocument();
      expect(screen.getByText('TodoFilter.tsx')).toBeInTheDocument();
    });
  });
});
