import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DependenciesView } from './DependenciesView';
import { DependencyUpdates } from '../types';

describe('DependenciesView Component', () => {
  const mockUpdates: DependencyUpdates = {
    packageJson: {
      add: {
        pinia: '^2.1.7',
        'vue-router': '^4.3.0',
      },
      remove: ['react', 'react-dom'],
    },
    composerJson: {
      add: {
        'inertiajs/inertia-laravel': '^1.0',
      },
    },
    notes: ['Initial setup required'],
  };

  const mockNotes = [
    'Initialize Pinia root in main.ts before mounting app',
    'Update tsconfig.json with vue compilerOptions',
  ];

  it('renders package additions, removals, and migration notes', () => {
    render(
      <DependenciesView
        updates={mockUpdates}
        migrationNotes={mockNotes}
        targetStack="vue"
      />
    );

    expect(screen.getByText('3. Dependencies & Migration Checklist')).toBeInTheDocument();
    expect(screen.getByText('pinia')).toBeInTheDocument();
    expect(screen.getByText('^2.1.7')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('react-dom')).toBeInTheDocument();

    // Check composer section
    expect(screen.getByText('inertiajs/inertia-laravel')).toBeInTheDocument();

    // Check migration notes
    expect(
      screen.getByText('Initialize Pinia root in main.ts before mounting app')
    ).toBeInTheDocument();
  });

  it('copies terminal install command to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(
      <DependenciesView
        updates={mockUpdates}
        migrationNotes={mockNotes}
        targetStack="vue"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy command/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('npm install pinia vue-router');
  });
});
