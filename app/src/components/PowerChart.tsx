import { Box, Paper, Typography, Skeleton } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TooltipProps } from "recharts";
import { usePower } from "@/api";
import type { PowerDataPoint } from "@/api/types";
import { formatTime } from "@/utils";

function PowerChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length || !label) return null;
  const p = payload[0]?.payload as {
    powerHistory: number | null;
    powerForecast: number | null;
    efficiency: number | null;
  } | undefined;
  if (!p) return null;
  const fmt = (v: number | null, unit: string) =>
    v != null && !Number.isNaN(v)
      ? unit === "kW"
        ? `${Number(v).toFixed(1)} kW`
        : `${Number(v).toFixed(1)}%`
      : "—";
  return (
    <Paper
      variant="outlined"
      sx={{ px: 1.5, py: 1, minWidth: 160 }}
    >
      <Typography variant="caption" display="block" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">
        History: {fmt(p.powerHistory, "kW")}
      </Typography>
      <Typography variant="body2">
        Forecast: {fmt(p.powerForecast, "kW")}
      </Typography>
      <Typography variant="body2">
        Efficiency: {fmt(p.efficiency, "%")}
      </Typography>
    </Paper>
  );
}

interface PowerChartProps {
  assetId: string;
}

export function PowerChart({ assetId }: PowerChartProps) {
  const { data, isLoading, error } = usePower(assetId);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Power Consumption
        </Typography>
        <Skeleton variant="rectangular" height={300} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Power Consumption
        </Typography>
        <Typography color="error">Failed to load power data.</Typography>
      </Paper>
    );
  }

  if (!data) return null;

  const historyPoints = data.history.map((p: PowerDataPoint) => ({
    name: formatTime(p.timestamp),
    powerHistory: p.power_kw,
    powerForecast: null as number | null,
    efficiency: p.efficiency,
  }));

  const forecastPoints = data.forecast.map((p: PowerDataPoint) => ({
    name: formatTime(p.timestamp),
    powerHistory: null as number | null,
    powerForecast: p.power_kw,
    efficiency: p.efficiency,
  }));

  const chartData = [...historyPoints, ...forecastPoints];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Power Consumption & Efficiency
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {data.asset_name} · Positive = consumption, negative = generation
      </Typography>
      <Box sx={{ width: "100%", height: 340, minHeight: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            margin={{ top: 16, right: 24, left: 8, bottom: 24 }}
            data={chartData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              axisLine={{ stroke: "#999" }}
              tickLine={{ stroke: "#999" }}
            />
            <YAxis
              yAxisId="power"
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: "#999" }}
              tickLine={{ stroke: "#999" }}
              label={{
                value: "Power (kW)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <YAxis
              yAxisId="efficiency"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: "#999" }}
              tickLine={{ stroke: "#999" }}
              label={{
                value: "Efficiency %",
                angle: 90,
                position: "insideRight",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip content={<PowerChartTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 8 }} />
            <ReferenceLine
              yAxisId="power"
              y={0}
              stroke="#666"
              strokeDasharray="2 2"
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="powerHistory"
              name="History (kW)"
              stroke="#4a7c59"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="powerForecast"
              name="Forecast (kW)"
              stroke="#ed6c02"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="efficiency"
              type="monotone"
              dataKey="efficiency"
              name="Efficiency %"
              stroke="#1565c0"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
