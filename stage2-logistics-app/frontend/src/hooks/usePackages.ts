import { useQuery } from "@tanstack/react-query";

import { packageService } from "../services/package.service";
import type { Package } from "../types/package.types";
import { QUERY_KEYS } from "../constants/queryKey";

export const usePackages = () =>
  useQuery({
    queryKey: QUERY_KEYS.PACKAGES,
    queryFn: () => packageService.getPackages(),
    select: (res) => res.data ?? [],
  });

export const usePackage = (trackingId: string) =>
  useQuery<Package>({
    queryKey: QUERY_KEYS.PACKAGE(trackingId),

    queryFn: () => packageService.getPackages(),

    enabled: !!trackingId,
  });
