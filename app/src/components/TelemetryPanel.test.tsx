import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { TelemetryPanel } from './TelemetryPanel';

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>();
  return {
    ...actual,
    useTelemetry: vi.fn(),
  };
});

const { useTelemetry } = await import('@/api');

const mockTelemetry = {
  asset_id: 'AST-001',
  timestamp: '2024-01-15T10:00:00Z',
  temperature: 45.5,
  pressure: 120.2,
  vibration: 1.8,
  power_consumption: 15.2,
  status: 'operational',
};

describe('TelemetryPanel', () => {
  beforeEach(() => {
    vi.mocked(useTelemetry).mockReturnValue({
      data: mockTelemetry,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTelemetry>);
  });

  it('renders telemetry metrics when data is loaded', () => {
    render(<TelemetryPanel assetId="AST-001" />);
    expect(screen.getByText('Telemetry')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('45.5 °C')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    vi.mocked(useTelemetry).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTelemetry>);
    render(<TelemetryPanel assetId="AST-001" />);
    expect(screen.getByText('Telemetry')).toBeInTheDocument();
  });
});
