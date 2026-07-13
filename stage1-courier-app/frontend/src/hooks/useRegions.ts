import { useQuery } from "@tanstack/react-query";
import { regionService } from "../services/region.service";
import { QUERY_KEYS } from "../constants/queryKey";

export const useRegions = () =>
  useQuery({
    queryKey: QUERY_KEYS.REGIONS,
    queryFn: regionService.getRegions,
  });
