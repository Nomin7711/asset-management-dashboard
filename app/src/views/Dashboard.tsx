import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAssets } from "@/api";
import { AssetList } from "@/components/AssetList";
import { PowerChart } from "@/components/PowerChart";

const CHART_STATUS_COLORS: Record<string, string> = {
  operational: "#4a7c59",
  standby: "#6b9b7a",
  maintenance: "#b8860b",
  default: "#757575",
};

const CHART_TYPE_COLORS = [
  "#4a7c59",
  "#5a8c69",
  "#3d6b4a",
  "#6b9b7a",
  "#2d5a3d",
];

export function Dashboard() {
  const navigate = useNavigate();
  const { data: assets = [], isLoading, error } = useAssets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // First row of the table: same as AssetList default (sort by name asc)
  const firstTableAssetId = useMemo(() => {
    if (assets.length === 0) return null;
    const sorted = [...assets].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
    return sorted[0].id;
  }, [assets]);

  const effectiveSelectedId = useMemo(() => {
    if (assets.length === 0) return null;
    if (selectedId && assets.some((a) => a.id === selectedId))
      return selectedId;
    return firstTableAssetId;
  }, [assets, selectedId, firstTableAssetId]);

  const chartStats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const a of assets) {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      byType[a.type] = (byType[a.type] ?? 0) + 1;
    }
    const statusData = Object.entries(byStatus).map(([name, value]) => ({
      name,
      value,
      fill: CHART_STATUS_COLORS[name] ?? CHART_STATUS_COLORS.default,
    }));
    const typeData = Object.entries(byType).map(([name, value], i) => ({
      name,
      count: value,
      fill: CHART_TYPE_COLORS[i % CHART_TYPE_COLORS.length],
    }));
    return { statusData, typeData };
  }, [assets]);

  if (isLoading)
    return <Typography sx={{ p: 2 }}>Loading assets...</Typography>;
  if (error)
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Failed to load assets.
      </Typography>
    );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "auto",
      }}
    >
      {assets.length > 0 && (
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Assets by status
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Count per status
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartStats.statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={72}
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {chartStats.statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Assets by type
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Count per asset type
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={chartStats.typeData}
                    margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.06)"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [value, "Count"]} />
                    <Bar
                      dataKey="count"
                      name="Assets"
                      fill="#4a7c59"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      {effectiveSelectedId && (
        <Box sx={{ flexShrink: 0 }}>
          <PowerChart assetId={effectiveSelectedId} />
        </Box>
      )}

      <Paper
        sx={{
          p: 2,
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 280,
          overflow: "hidden",
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
          Assets
        </Typography>
        <AssetList
          assets={assets}
          onSelect={(id) => setSelectedId(id)}
          selectedId={effectiveSelectedId}
          onViewDetails={(id) => navigate(`/asset/${id}`)}
        />
      </Paper>
    </Box>
  );
}
