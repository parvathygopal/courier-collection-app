import { useQuery } from "@tanstack/react-query";

import { packageService } from "../services/package.service";
import type { Package } from "../types/package.types";
import { QUERY_KEYS } from "../constants/queryKey";

export const usePackages = () =>
  useQuery({
    queryKey: QUERY_KEYS.PACKAGES,
    queryFn: async () => {
      const res = await packageService.getPackages();
      return res.data ?? [];
    },
  });

export const usePackage = (trackingId: string) =>
  useQuery<Package | null>({
    queryKey: QUERY_KEYS.PACKAGE(trackingId),

    queryFn: async () => {
      const res = await packageService.getPackage(trackingId);
      return res.data ?? null;
    },

    enabled: !!trackingId,
  });
