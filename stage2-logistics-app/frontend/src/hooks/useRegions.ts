import { useQuery } from "@tanstack/react-query";

import { regionService } from "../services/region.service";
import type { Region } from "../types/package.types";
import { QUERY_KEYS } from "../constants/queryKey";

export const useRegions = () =>
  useQuery({
    queryKey: QUERY_KEYS.REGIONS,
    queryFn: async () => {
      const res = await regionService.getRegions();
      return res.data ?? [];
    },
  });
