/** API types matching the backend FastAPI/Pydantic models */

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  last_updated: string;
}

export interface Telemetry {
  asset_id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  vibration: number;
  power_consumption: number;
  status: string;
}

export interface PowerDataPoint {
  timestamp: string;
  power_kw: number;
  efficiency: number;
}

export interface PowerHistory {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  history: PowerDataPoint[];
  forecast: PowerDataPoint[];
  metadata: Record<string, unknown>;
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceMode = 'scheduled' | 'predictive' | 'reactive';
export type OperatingMode = 'continuous' | 'intermittent' | 'on_demand';

export interface AssetConfiguration {
  asset_id: string;
  name: string;
  priority: PriorityLevel;
  maintenance_mode: MaintenanceMode;
  operating_mode: OperatingMode;
  maintenance_interval_days: number;
  max_runtime_hours: number;
  warning_threshold_percent: number;
  max_temperature_celsius: number;
  max_pressure_psi: number;
  efficiency_target_percent: number;
  power_factor: number;
  load_capacity_percent: number;
  alert_email: string;
  location: string;
  notes?: string | null;
}

export interface ConfigurationListResponse {
  configurations: AssetConfiguration[];
  count: number;
}

export interface TelemetryUpdateMessage {
  type: 'telemetry_update';
  timestamp: string;
  data: Telemetry[];
}
