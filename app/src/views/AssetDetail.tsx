import { useParams, useNavigate } from "react-router-dom";
import { Box, Breadcrumbs, Typography, Button } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useAsset } from "@/api";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { ConfigurationForm } from "@/components/ConfigurationForm";

export function AssetDetail() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { data: asset, isLoading, error } = useAsset(assetId ?? null);

  if (!assetId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">No asset selected.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  if (error || !asset) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Asset not found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}
    >
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate("/")}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to list
      </Button>
      <Breadcrumbs sx={{ flexShrink: 0 }}>
        <Typography color="text.secondary" fontWeight={600}>
          {asset.name}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
          minHeight: 0,
        }}
      >
        <TelemetryPanel assetId={assetId} />
        <ConfigurationForm assetId={assetId} />
      </Box>
    </Box>
  );
}
