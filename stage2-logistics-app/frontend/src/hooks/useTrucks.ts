import { useQuery } from "@tanstack/react-query";
import { truckService } from "../services/truck.service";
import { QUERY_KEYS } from "../constants/queryKey";

export const useTrucks = (page = 1, limit = 10) =>
  useQuery({
    queryKey: QUERY_KEYS.TRUCKS,
    queryFn: () => truckService.getTrucks(page, limit),
    select: (res) => res.data ?? [],
  });

export const useTruck = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.TRUCK(id),
    queryFn: () => Promise.resolve(null),
    enabled: !!id,
  });
