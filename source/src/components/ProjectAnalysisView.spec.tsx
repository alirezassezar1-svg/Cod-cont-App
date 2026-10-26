import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectAnalysisView } from './ProjectAnalysisView';
import { ProjectAnalysis } from '../types';

describe('ProjectAnalysisView Component', () => {
  const mockAnalysis: ProjectAnalysis = {
    sourceSummary: 'React 19 SPA with Context API for state management and modular TypeScript types',
    keyDecisions: [
      'Migrated React Context to Pinia store for reactivity',
      'Converted custom hooks to Vue 3 composables',
      'Maintained TypeScript interface definitions in shared types directory',
    ],
    sharedModules: ['src/types/cart.ts', 'src/hooks/useLocalStorage.ts'],
    relationships: [
      {
        from: 'src/context/CartContext.tsx',
        to: 'src/types/cart.ts',
        type: 'types',
        description: 'Imports CartItem and CartState interfaces',
      },
      {
        from: 'src/components/ProductCard.tsx',
        to: 'src/context/CartContext.tsx',
        type: 'uses-store',
        description: 'Dispatches addToCart actions',
      },
    ],
  };

  it('renders summary, key decisions, shared modules, and relationships', () => {
    render(<ProjectAnalysisView analysis={mockAnalysis} />);

    expect(screen.getByText('1. Project Analysis')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysis.sourceSummary)).toBeInTheDocument();

    // Check decisions
    expect(
      screen.getByText('Migrated React Context to Pinia store for reactivity')
    ).toBeInTheDocument();

    // Check shared modules
    expect(screen.getAllByText('src/types/cart.ts')[0]).toBeInTheDocument();
    expect(screen.getAllByText('src/hooks/useLocalStorage.ts')[0]).toBeInTheDocument();

    // Check relationships
    expect(screen.getAllByText('src/context/CartContext.tsx')[0]).toBeInTheDocument();
    expect(screen.getAllByText('src/components/ProductCard.tsx')[0]).toBeInTheDocument();
  });
});
