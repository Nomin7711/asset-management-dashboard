/** Centralized query keys for TanStack Query */

export const queryKeys = {
  all: ['assets'] as const,
  assets: () => [...queryKeys.all] as const,
  asset: (id: string) => ['asset', id] as const,
  telemetry: (assetId: string) => ['telemetry', assetId] as const,
  power: (assetId: string) => ['power', assetId] as const,
  configuration: (assetId: string) => ['configuration', assetId] as const,
  configurations: () => ['configurations'] as const,
} as const;
