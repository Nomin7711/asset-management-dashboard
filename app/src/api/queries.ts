import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssets,
  fetchAsset,
  fetchTelemetry,
  fetchPower,
  fetchConfiguration,
  fetchAllConfigurations,
  saveConfiguration,
} from './client';
import { queryKeys } from './queryKeys';
import type { AssetConfiguration } from './types';

export { queryKeys };

export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets(),
    queryFn: fetchAssets,
  });
}

export function useAsset(assetId: string | null) {
  return useQuery({
    queryKey: queryKeys.asset(assetId ?? ''),
    queryFn: () => fetchAsset(assetId!),
    enabled: !!assetId,
  });
}

export function useTelemetry(assetId: string | null) {
  return useQuery({
    queryKey: queryKeys.telemetry(assetId ?? ''),
    queryFn: () => fetchTelemetry(assetId!),
    enabled: !!assetId,
  });
}

export function usePower(assetId: string | null) {
  return useQuery({
    queryKey: queryKeys.power(assetId ?? ''),
    queryFn: () => fetchPower(assetId!),
    enabled: !!assetId,
  });
}

export function useConfiguration(assetId: string | null) {
  return useQuery({
    queryKey: queryKeys.configuration(assetId ?? ''),
    queryFn: () => fetchConfiguration(assetId!),
    enabled: !!assetId,
    retry: false,
  });
}

export function useAllConfigurations() {
  return useQuery({
    queryKey: queryKeys.configurations(),
    queryFn: fetchAllConfigurations,
  });
}

type SaveConfigurationOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useSaveConfiguration(assetId: string, options?: SaveConfigurationOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssetConfiguration) => saveConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.configuration(assetId) });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

