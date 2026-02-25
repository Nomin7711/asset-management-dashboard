import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  useAsset,
  useConfiguration,
  useSaveConfiguration,
  getValidationErrors,
} from "@/api";
import Grid from "@mui/material/Grid2";
import type { AssetConfiguration } from "@/api/types";

const configSchema = z.object({
  asset_id: z.string().min(1).max(50),
  name: z.string().min(3).max(100),
  priority: z.enum(["low", "medium", "high", "critical"]),
  maintenance_mode: z.enum(["scheduled", "predictive", "reactive"]),
  operating_mode: z.enum(["continuous", "intermittent", "on_demand"]),
  maintenance_interval_days: z.number().int().min(1).max(365),
  max_runtime_hours: z.number().int().min(1).max(100000),
  warning_threshold_percent: z.number().int().min(0).max(100),
  max_temperature_celsius: z.number().min(-50).max(200),
  max_pressure_psi: z.number().min(0).max(10000),
  efficiency_target_percent: z.number().min(0).max(100),
  power_factor: z
    .number()
    .min(-1)
    .max(1)
    .refine((v) => v !== 0, "Power factor cannot be zero"),
  load_capacity_percent: z.number().min(0).max(150),
  alert_email: z.string().email(),
  location: z.string().min(1).max(200),
  notes: z.string().max(500).optional().nullable(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface ConfigurationFormProps {
  assetId: string;
}

const defaultValues: ConfigFormData = {
  asset_id: "",
  name: "",
  priority: "medium",
  maintenance_mode: "predictive",
  operating_mode: "continuous",
  maintenance_interval_days: 30,
  max_runtime_hours: 50000,
  warning_threshold_percent: 85,
  max_temperature_celsius: 80,
  max_pressure_psi: 200,
  efficiency_target_percent: 85,
  power_factor: 0.95,
  load_capacity_percent: 100,
  alert_email: "",
  location: "",
  notes: "",
};

export function ConfigurationForm({ assetId }: ConfigurationFormProps) {
  const { data: asset } = useAsset(assetId);
  const { data: existingConfig, isLoading: configLoading } =
    useConfiguration(assetId);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: { ...defaultValues, asset_id: assetId },
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = form;

  const mutation = useSaveConfiguration(assetId, {
    onSuccess: () => reset(undefined, { keepValues: true }),
    onError: (error) => {
      const messages = getValidationErrors(error);
      setError("root", { type: "server", message: messages.join(". ") });
    },
  });

  useEffect(() => {
    reset({ ...defaultValues, asset_id: assetId });
  }, [assetId, reset]);

  useEffect(() => {
    if (!assetId) return;
    setValue("asset_id", assetId);
    if (existingConfig) {
      const c = existingConfig as AssetConfiguration;
      setValue("name", c.name);
      setValue("priority", c.priority ?? defaultValues.priority);
      setValue("maintenance_mode", c.maintenance_mode ?? defaultValues.maintenance_mode);
      setValue("operating_mode", c.operating_mode ?? defaultValues.operating_mode);
      setValue("maintenance_interval_days", c.maintenance_interval_days);
      setValue("max_runtime_hours", c.max_runtime_hours);
      setValue("warning_threshold_percent", c.warning_threshold_percent);
      setValue("max_temperature_celsius", c.max_temperature_celsius);
      setValue("max_pressure_psi", c.max_pressure_psi);
      setValue("efficiency_target_percent", c.efficiency_target_percent);
      setValue("power_factor", c.power_factor);
      setValue("load_capacity_percent", c.load_capacity_percent);
      setValue("alert_email", c.alert_email);
      setValue("location", c.location);
      setValue("notes", c.notes ?? "");
    } else if (asset) {
      setValue("name", asset.name);
      setValue("location", asset.location);
    }
  }, [assetId, asset, existingConfig, setValue]);

  const onSubmit = (data: ConfigFormData) => {
    mutation.reset();
    mutation.mutate({ ...data, asset_id: assetId } as AssetConfiguration);
  };

  if (configLoading && !existingConfig && !asset) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Configuration
        </Typography>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Configuration
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {mutation.isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => mutation.reset()}
          >
            {errors.root?.message ?? "Failed to save configuration."}
          </Alert>
        )}
        {mutation.isSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => mutation.reset()}
          >
            Configuration saved successfully.
          </Alert>
        )}

        <Accordion
          defaultExpanded
          disableGutters
          sx={{ boxShadow: "none", "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Basic info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Asset ID"
                  value={assetId}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Name"
                  {...register("name")}
                  helperText={errors.name?.message}
                  error={!!errors.name}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="priority"
                  control={form.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Priority"
                      value={field.value ?? defaultValues.priority}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      helperText={errors.priority?.message}
                      error={!!errors.priority}
                      size="small"
                    >
                      {["low", "medium", "high", "critical"].map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="maintenance_mode"
                  control={form.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Maintenance mode"
                      value={field.value ?? defaultValues.maintenance_mode}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      helperText={errors.maintenance_mode?.message}
                      error={!!errors.maintenance_mode}
                      size="small"
                    >
                      {["scheduled", "predictive", "reactive"].map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="operating_mode"
                  control={form.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Operating mode"
                      value={field.value ?? defaultValues.operating_mode}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      helperText={errors.operating_mode?.message}
                      error={!!errors.operating_mode}
                      size="small"
                    >
                      {["continuous", "intermittent", "on_demand"].map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion
          disableGutters
          sx={{ boxShadow: "none", "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Operating limits</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maintenance interval (days)"
                  {...register("maintenance_interval_days", {
                    valueAsNumber: true,
                  })}
                  inputProps={{ min: 1, max: 365 }}
                  helperText={errors.maintenance_interval_days?.message}
                  error={!!errors.maintenance_interval_days}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max runtime (hours)"
                  {...register("max_runtime_hours", { valueAsNumber: true })}
                  inputProps={{ min: 1, max: 100000 }}
                  helperText={errors.max_runtime_hours?.message}
                  error={!!errors.max_runtime_hours}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Warning threshold (%)"
                  {...register("warning_threshold_percent", {
                    valueAsNumber: true,
                  })}
                  inputProps={{ min: 0, max: 100 }}
                  helperText={errors.warning_threshold_percent?.message}
                  error={!!errors.warning_threshold_percent}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max temperature (°C)"
                  {...register("max_temperature_celsius", {
                    valueAsNumber: true,
                  })}
                  inputProps={{ min: -50, max: 200, step: 0.1 }}
                  helperText={errors.max_temperature_celsius?.message}
                  error={!!errors.max_temperature_celsius}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max pressure (psi)"
                  {...register("max_pressure_psi", { valueAsNumber: true })}
                  inputProps={{ min: 0, max: 10000, step: 0.1 }}
                  helperText={errors.max_pressure_psi?.message}
                  error={!!errors.max_pressure_psi}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Efficiency target (%)"
                  {...register("efficiency_target_percent", {
                    valueAsNumber: true,
                  })}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  helperText={errors.efficiency_target_percent?.message}
                  error={!!errors.efficiency_target_percent}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Power factor"
                  {...register("power_factor", { valueAsNumber: true })}
                  inputProps={{ min: -1, max: 1, step: 0.01 }}
                  helperText={errors.power_factor?.message}
                  error={!!errors.power_factor}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Load capacity (%)"
                  {...register("load_capacity_percent", {
                    valueAsNumber: true,
                  })}
                  inputProps={{ min: 0, max: 150, step: 0.1 }}
                  helperText={errors.load_capacity_percent?.message}
                  error={!!errors.load_capacity_percent}
                  size="small"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion
          disableGutters
          sx={{ boxShadow: "none", "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Alerts & location</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Alert email"
                  {...register("alert_email")}
                  helperText={errors.alert_email?.message}
                  error={!!errors.alert_email}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Location"
                  {...register("location")}
                  helperText={errors.location?.message}
                  error={!!errors.location}
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes (optional)"
                  {...register("notes")}
                  helperText={errors.notes?.message}
                  error={!!errors.notes}
                  size="small"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save configuration"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
