import { Paper, Typography, Chip, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { useTelemetry, getTelemetryWebSocketUrl } from '@/api';
import type { Telemetry as TelemetryType } from '@/api/types';

interface TelemetryPanelProps {
  assetId: string;
}

export function TelemetryPanel({ assetId }: TelemetryPanelProps) {
  const [liveTelemetry, setLiveTelemetry] = useState<TelemetryType | null>(null);

  const {
    data: telemetry,
    isLoading,
    error,
    refetch,
  } = useTelemetry(assetId);

  useEffect(() => {
    const url = getTelemetryWebSocketUrl();
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry_update' && Array.isArray(msg.data)) {
          const forAsset = msg.data.find((d: TelemetryType) => d.asset_id === assetId);
          if (forAsset) setLiveTelemetry(forAsset);
        }
      } catch {
        // ignore parse errors
      }
    };
    ws.onerror = () => {};
    return () => ws.close();
  }, [assetId]);

  const display = liveTelemetry ?? telemetry;

  if (isLoading && !display) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Telemetry
        </Typography>
        <Skeleton variant="rectangular" height={120} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Telemetry
        </Typography>
        <Typography color="error">Failed to load telemetry.</Typography>
      </Paper>
    );
  }

  if (!display) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Telemetry
        {liveTelemetry && (
          <Chip size="small" label="Live" color="success" onClick={() => refetch()} />
        )}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Temperature
          </Typography>
          <Typography variant="h6">{display.temperature.toFixed(1)} °C</Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Pressure
          </Typography>
          <Typography variant="h6">{display.pressure.toFixed(1)} psi</Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Vibration
          </Typography>
          <Typography variant="h6">{display.vibration.toFixed(2)}</Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Power
          </Typography>
          <Typography variant="h6">{display.power_consumption.toFixed(1)} kW</Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Status
          </Typography>
          <Typography variant="h6">{display.status}</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="caption" color="text.secondary">
            Updated: {new Date(display.timestamp).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
