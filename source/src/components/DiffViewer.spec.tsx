import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiffViewer } from './DiffViewer';
import { ConvertedFile, ProjectFile } from '../types';

describe('DiffViewer Component', () => {
  const sourceFiles: ProjectFile[] = [
    {
      id: '1',
      path: 'src/components/Counter.tsx',
      language: 'typescript',
      content: `import { useState } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`,
    },
  ];

  const convertedFiles: ConvertedFile[] = [
    {
      path: 'src/components/Counter.vue',
      originalPath: 'src/components/Counter.tsx',
      language: 'vue',
      content: `<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>
<template>
  <div>{{ count }}</div>
</template>`,
      explanation: 'Transformed useState to Vue 3 ref and template syntax',
      status: 'created',
    },
  ];

  it('renders side-by-side view with source and target panels', () => {
    render(
      <DiffViewer
        convertedFiles={convertedFiles}
        sourceFiles={sourceFiles}
        onDownloadFile={vi.fn()}
      />
    );

    expect(screen.getByText('Source: src/components/Counter.tsx')).toBeInTheDocument();
    expect(screen.getByText('Target: src/components/Counter.vue')).toBeInTheDocument();
    expect(screen.getByText('Transformation Rationale:')).toBeInTheDocument();
    expect(
      screen.getByText('Transformed useState to Vue 3 ref and template syntax')
    ).toBeInTheDocument();
  });

  it('toggles to Unified Diff mode', async () => {
    const user = userEvent.setup();
    render(
      <DiffViewer
        convertedFiles={convertedFiles}
        sourceFiles={sourceFiles}
        onDownloadFile={vi.fn()}
      />
    );

    const unifiedBtn = screen.getByRole('button', { name: /unified diff/i });
    await user.click(unifiedBtn);

    expect(screen.getByText(/comparing/i)).toBeInTheDocument();
    expect(screen.getAllByText('src/components/Counter.vue')[0]).toBeInTheDocument();
  });

  it('handles copy and triggers onDownloadFile', async () => {
    const user = userEvent.setup();
    const onDownloadFile = vi.fn();

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    render(
      <DiffViewer
        convertedFiles={convertedFiles}
        sourceFiles={sourceFiles}
        onDownloadFile={onDownloadFile}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy target/i });
    await user.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(convertedFiles[0].content);

    const downloadBtn = screen.getByRole('button', { name: /download/i });
    await user.click(downloadBtn);
    expect(onDownloadFile).toHaveBeenCalledWith(convertedFiles[0]);
  });
});
