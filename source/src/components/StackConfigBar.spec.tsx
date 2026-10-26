import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StackConfigBar } from './StackConfigBar';
import { ConversionConfig } from '../types';

describe('StackConfigBar Component', () => {
  const initialConfig: ConversionConfig = {
    sourceStack: 'react',
    targetStack: 'vue',
    useTypeScript: true,
    architecture: 'standard',
    preserveComments: true,
    stateStrategy: 'auto',
  };

  it('renders source and target framework selection dropdowns', () => {
    render(
      <StackConfigBar
        config={initialConfig}
        onChangeConfig={vi.fn()}
        onSelectSample={vi.fn()}
      />
    );

    expect(screen.getByText('Source:')).toBeInTheDocument();
    expect(screen.getByText('Target:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('React (TSX / Hooks)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Vue 3 (<script setup> + Pinia)')).toBeInTheDocument();
  });

  it('calls onChangeConfig when changing target framework', async () => {
    const user = userEvent.setup();
    const onChangeConfig = vi.fn();
    render(
      <StackConfigBar
        config={initialConfig}
        onChangeConfig={onChangeConfig}
        onSelectSample={vi.fn()}
      />
    );

    const targetSelect = screen.getByDisplayValue('Vue 3 (<script setup> + Pinia)');
    await user.selectOptions(targetSelect, 'svelte');
    expect(onChangeConfig).toHaveBeenCalledWith({ targetStack: 'svelte' });
  });

  it('toggles architecture layout between Standard and Monorepo', async () => {
    const user = userEvent.setup();
    const onChangeConfig = vi.fn();
    render(
      <StackConfigBar
        config={initialConfig}
        onChangeConfig={onChangeConfig}
        onSelectSample={vi.fn()}
      />
    );

    const monorepoBtn = screen.getByRole('button', { name: /monorepo/i });
    await user.click(monorepoBtn);
    expect(onChangeConfig).toHaveBeenCalledWith({ architecture: 'monorepo' });
  });

  it('toggles TypeScript mode on button click', async () => {
    const user = userEvent.setup();
    const onChangeConfig = vi.fn();
    render(
      <StackConfigBar
        config={initialConfig}
        onChangeConfig={onChangeConfig}
        onSelectSample={vi.fn()}
      />
    );

    const tsBtn = screen.getByRole('button', { name: /typescript \(strict\)/i });
    await user.click(tsBtn);
    expect(onChangeConfig).toHaveBeenCalledWith({ useTypeScript: false });
  });

  it('calls onSelectSample when selecting a template from dropdown', async () => {
    const user = userEvent.setup();
    const onSelectSample = vi.fn();
    render(
      <StackConfigBar
        config={initialConfig}
        onChangeConfig={vi.fn()}
        onSelectSample={onSelectSample}
      />
    );

    const sampleSelect = screen.getByDisplayValue('Choose a multi-file project...');
    await user.selectOptions(sampleSelect, 'react-cart-auth');
    expect(onSelectSample).toHaveBeenCalledWith('react-cart-auth');
  });
});
