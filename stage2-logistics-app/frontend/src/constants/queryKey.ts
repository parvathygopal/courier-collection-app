export const QUERY_KEYS = {
  PACKAGES: ["packages"] as const,

  PACKAGE: (trackingId: string) => ["package", trackingId] as const,

  HISTORY: (trackingId: string) => ["history", trackingId] as const,

  DASHBOARD: ["dashboard"] as const,
  BAGS: ["bags"] as const,
  BAG: (id: string) => ["bag", id] as const,
  TRUCKS: ["trucks"] as const,
  TRUCK: (id: string) => ["truck", id] as const,
  REGIONS: ["regions"] as const,
};
