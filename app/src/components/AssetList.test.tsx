import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AssetList } from './AssetList';
import type { Asset } from '@/api/types';

const mockAssets: Asset[] = [
  {
    id: 'AST-001',
    name: 'Primary Cooling Pump',
    type: 'pump',
    location: 'Building A',
    status: 'operational',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 'AST-002',
    name: 'Air Compressor',
    type: 'compressor',
    location: 'Building B',
    status: 'standby',
    last_updated: '2024-01-15T11:00:00Z',
  },
];

describe('AssetList', () => {
  it('renders asset table with headers', () => {
    const onSelect = vi.fn();
    render(
      <AssetList assets={mockAssets} onSelect={onSelect} selectedId={null} />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders asset rows', () => {
    const onSelect = vi.fn();
    render(
      <AssetList assets={mockAssets} onSelect={onSelect} selectedId={null} />
    );
    expect(screen.getByText('Primary Cooling Pump')).toBeInTheDocument();
    expect(screen.getByText('Air Compressor')).toBeInTheDocument();
  });

  it('calls onSelect when row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <AssetList assets={mockAssets} onSelect={onSelect} selectedId={null} />
    );
    screen.getByText('Primary Cooling Pump').click();
    expect(onSelect).toHaveBeenCalledWith('AST-001');
  });

  it('shows details icon when onViewDetails is provided', () => {
    const onSelect = vi.fn();
    const onViewDetails = vi.fn();
    render(
      <AssetList
        assets={mockAssets}
        onSelect={onSelect}
        selectedId={null}
        onViewDetails={onViewDetails}
      />
    );
    const buttons = screen.getAllByRole('button', { name: /view asset details/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
