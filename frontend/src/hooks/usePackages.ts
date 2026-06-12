import { useQuery } from "@tanstack/react-query";

import { packageService } from "../services/package.service";
import type { Package } from "../types/package.types";
import { QUERY_KEYS } from "../constants/queryKey";

export const usePackages = () =>
  useQuery<Package[]>({
    queryKey: QUERY_KEYS.PACKAGES,

    queryFn: () => packageService.getPackages(),
  });

export const usePackage = (trackingId: string) =>
  useQuery<Package>({
    queryKey: QUERY_KEYS.PACKAGE(trackingId),

    queryFn: () => packageService.getPackage(trackingId),

    enabled: !!trackingId,
  });
