import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectFileTree } from './ProjectFileTree';
import { ProjectFile } from '../types';

describe('ProjectFileTree Component', () => {
  const sampleFiles: ProjectFile[] = [
    {
      id: 'file-1',
      path: 'src/types/cart.ts',
      language: 'typescript',
      content: 'export interface CartItem { id: string; }',
    },
    {
      id: 'file-2',
      path: 'src/components/ProductCard.tsx',
      language: 'typescript',
      content: 'export function ProductCard() { return <div>Card</div>; }',
    },
  ];

  it('renders source tree files and folder hierarchy', () => {
    render(
      <ProjectFileTree
        files={sampleFiles}
        selectedFileId="file-1"
        onSelectFile={vi.fn()}
        onAddFileClick={vi.fn()}
        onDeleteFile={vi.fn()}
        onResetFiles={vi.fn()}
      />
    );

    expect(screen.getByText('Source Tree')).toBeInTheDocument();
    expect(screen.getByText('(2 files)')).toBeInTheDocument();
    expect(screen.getByText('cart.ts')).toBeInTheDocument();
    expect(screen.getByText('ProductCard.tsx')).toBeInTheDocument();
  });

  it('calls onSelectFile when clicking on a file item', async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn();

    render(
      <ProjectFileTree
        files={sampleFiles}
        selectedFileId="file-1"
        onSelectFile={onSelectFile}
        onAddFileClick={vi.fn()}
        onDeleteFile={vi.fn()}
        onResetFiles={vi.fn()}
      />
    );

    const cardFile = screen.getByText('ProductCard.tsx');
    await user.click(cardFile);
    expect(onSelectFile).toHaveBeenCalledWith('file-2');
  });

  it('triggers onAddFileClick when clicking the plus button', async () => {
    const user = userEvent.setup();
    const onAddFileClick = vi.fn();

    render(
      <ProjectFileTree
        files={sampleFiles}
        selectedFileId="file-1"
        onSelectFile={vi.fn()}
        onAddFileClick={onAddFileClick}
        onDeleteFile={vi.fn()}
        onResetFiles={vi.fn()}
      />
    );

    const addBtn = screen.getByTitle('Add new file');
    await user.click(addBtn);
    expect(onAddFileClick).toHaveBeenCalledTimes(1);
  });

  it('triggers onResetFiles when clicking reset button', async () => {
    const user = userEvent.setup();
    const onResetFiles = vi.fn();

    render(
      <ProjectFileTree
        files={sampleFiles}
        selectedFileId="file-1"
        onSelectFile={vi.fn()}
        onAddFileClick={vi.fn()}
        onDeleteFile={vi.fn()}
        onResetFiles={onResetFiles}
      />
    );

    const resetBtn = screen.getByTitle('Reset files to active sample');
    await user.click(resetBtn);
    expect(onResetFiles).toHaveBeenCalledTimes(1);
  });
});
