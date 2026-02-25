import axios, { AxiosError } from 'axios';
import type {
  Asset,
  Telemetry,
  PowerHistory,
  AssetConfiguration,
  ConfigurationListResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchAssets(): Promise<Asset[]> {
  const { data } = await client.get<Asset[]>('/api/assets');
  return data;
}

export async function fetchAsset(assetId: string): Promise<Asset> {
  const { data } = await client.get<Asset>(`/api/assets/${assetId}`);
  return data;
}

export async function fetchTelemetry(assetId: string): Promise<Telemetry> {
  const { data } = await client.get<Telemetry>(`/api/telemetry/${assetId}`);
  return data;
}

export async function fetchPower(assetId: string): Promise<PowerHistory> {
  const { data } = await client.get<PowerHistory>(`/api/power/${assetId}`);
  return data;
}

export async function fetchConfiguration(
  assetId: string
): Promise<AssetConfiguration> {
  const { data } = await client.get<AssetConfiguration>(
    `/api/configuration/${assetId}`
  );
  return data;
}

export async function fetchAllConfigurations(): Promise<ConfigurationListResponse> {
  const { data } = await client.get<ConfigurationListResponse>(
    '/api/configurations'
  );
  return data;
}

export async function saveConfiguration(
  config: AssetConfiguration
): Promise<AssetConfiguration> {
  const { data } = await client.post<AssetConfiguration>(
    '/api/configuration',
    config
  );
  return data;
}

/** Get WebSocket URL for telemetry (same host as API) */
export function getTelemetryWebSocketUrl(): string {
  const base = API_BASE.replace(/^http/, 'ws');
  return `${base}/ws/telemetry`;
}

/** Helper to extract validation error detail from API response */
export function getValidationErrors(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ detail?: string | { msg?: string; loc?: string[] }[] }>;
    const detail = ax.response?.data?.detail;
    if (typeof detail === 'string') return [detail];
    if (Array.isArray(detail)) {
      return detail.map(
        (d) => (typeof d === 'object' && d?.msg ? d.msg : String(d))
      );
    }
  }
  return ['An unexpected error occurred.'];
}
