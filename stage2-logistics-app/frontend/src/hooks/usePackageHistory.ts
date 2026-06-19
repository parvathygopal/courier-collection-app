import { useQuery } from "@tanstack/react-query";

import { packageService } from "../services/package.service";
import { QUERY_KEYS } from "../constants/queryKey";
import type { TrackingHistory } from "../types/package.types";

export const usePackageHistory = (trackingId: string) =>
  useQuery<TrackingHistory[]>({
    queryKey: QUERY_KEYS.HISTORY(trackingId),

    queryFn: async () => {
      const res = await packageService.getHistory(trackingId);
      return res.data ?? [];
    },

    enabled: !!trackingId,
  });
