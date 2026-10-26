import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TargetStructureView } from './TargetStructureView';
import { TargetStructure } from '../types';

describe('TargetStructureView Component', () => {
  const mockStructure: TargetStructure = {
    isMonorepo: true,
    treeDescription: `apps/
  web/
    src/
packages/
  ui/
  shared/
  types/`,
    explanation: 'Turborepo layout isolating UI components into packages/ui and stores into packages/shared',
    fileMapping: [
      {
        source: 'src/components/ProductCard.tsx',
        target: 'packages/ui/components/ProductCard.vue',
        reason: 'Reusable UI component moved to design system package',
      },
      {
        source: 'src/types/cart.ts',
        target: 'packages/types/cart.ts',
        reason: 'Shared TypeScript schemas across web and mobile packages',
      },
    ],
  };

  it('renders ASCII tree description, monorepo badge, and file mapping table', () => {
    render(<TargetStructureView structure={mockStructure} />);

    expect(screen.getByText(/2\. Recommended Target Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Workspace Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(mockStructure.explanation!)).toBeInTheDocument();

    // Check mapping table
    expect(screen.getByText('src/components/ProductCard.tsx')).toBeInTheDocument();
    expect(screen.getByText('packages/ui/components/ProductCard.vue')).toBeInTheDocument();
    expect(
      screen.getByText('Reusable UI component moved to design system package')
    ).toBeInTheDocument();
  });
});
