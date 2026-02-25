import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Dashboard } from './Dashboard';

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>();
  return {
    ...actual,
    useAssets: vi.fn(),
  };
});

const { useAssets } = await import('@/api');

const mockAssets = [
  {
    id: 'AST-001',
    name: 'Primary Cooling Pump',
    type: 'pump',
    location: 'Building A',
    status: 'operational',
    last_updated: '2024-01-15T10:00:00Z',
  },
];

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useAssets).mockReturnValue({
      data: mockAssets,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssets>);
  });

  it('shows loading state when isLoading is true', () => {
    vi.mocked(useAssets).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssets>);
    render(<Dashboard />);
    expect(screen.getByText(/loading assets/i)).toBeInTheDocument();
  });

  it('shows error state when error is set', () => {
    vi.mocked(useAssets).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssets>);
    render(<Dashboard />);
    expect(screen.getByText(/failed to load assets/i)).toBeInTheDocument();
  });

  it('renders Overview and asset table when data is loaded', () => {
    render(<Dashboard />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Primary Cooling Pump')).toBeInTheDocument();
  });
});
