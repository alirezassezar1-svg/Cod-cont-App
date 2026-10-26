import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

describe('Header Component', () => {
  const defaultProps = {
    onConvert: vi.fn(),
    isConverting: false,
    onExportZip: vi.fn(),
    hasConvertedResult: false,
    activeView: 'editor' as const,
    setActiveView: vi.fn(),
    fileCount: 4,
    engine: 'gemini-3.8-flash' as const,
    latencyMs: 320,
  };

  it('renders brand title and version', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Code Converter Pro')).toBeInTheDocument();
    expect(screen.getByText('v4.0')).toBeInTheDocument();
  });

  it('displays the file count in the source editor tab button', () => {
    render(<Header {...defaultProps} fileCount={7} />);
    expect(screen.getByText('Source Editor (7)')).toBeInTheDocument();
  });

  it('disables result tabs when hasConvertedResult is false', () => {
    render(<Header {...defaultProps} hasConvertedResult={false} />);
    const diffBtn = screen.getByRole('button', { name: /diff & converted/i });
    expect(diffBtn).toBeDisabled();
  });

  it('enables result tabs when hasConvertedResult is true and triggers setActiveView on click', async () => {
    const user = userEvent.setup();
    const setActiveView = vi.fn();
    render(
      <Header
        {...defaultProps}
        hasConvertedResult={true}
        setActiveView={setActiveView}
      />
    );

    const diffBtn = screen.getByRole('button', { name: /diff & converted/i });
    expect(diffBtn).not.toBeDisabled();
    await user.click(diffBtn);
    expect(setActiveView).toHaveBeenCalledWith('diff');

    const analysisBtn = screen.getByRole('button', { name: /project analysis/i });
    await user.click(analysisBtn);
    expect(setActiveView).toHaveBeenCalledWith('analysis');
  });

  it('renders the Convert Project button and triggers onConvert when clicked', async () => {
    const user = userEvent.setup();
    const onConvert = vi.fn();
    render(<Header {...defaultProps} onConvert={onConvert} />);

    const convertBtn = screen.getByRole('button', { name: /convert project/i });
    await user.click(convertBtn);
    expect(onConvert).toHaveBeenCalledTimes(1);
  });

  it('shows converting state and disables button during conversion', () => {
    render(<Header {...defaultProps} isConverting={true} />);
    const convertingBtn = screen.getByRole('button', { name: /transforming codebase/i });
    expect(convertingBtn).toBeDisabled();
  });

  it('renders Export ZIP button when hasConvertedResult is true and invokes onExportZip', async () => {
    const user = userEvent.setup();
    const onExportZip = vi.fn();
    render(<Header {...defaultProps} hasConvertedResult={true} onExportZip={onExportZip} />);

    const exportBtn = screen.getByRole('button', { name: /export zip/i });
    expect(exportBtn).toBeInTheDocument();
    await user.click(exportBtn);
    expect(onExportZip).toHaveBeenCalledTimes(1);
  });
});
