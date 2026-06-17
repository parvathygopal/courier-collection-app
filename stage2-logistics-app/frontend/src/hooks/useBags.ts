import { useQuery } from "@tanstack/react-query";
import { bagService } from "../services/bag.service";
import { QUERY_KEYS } from "../constants/queryKey";

export const useBags = (page = 1, limit = 10) =>
  useQuery({
    queryKey: QUERY_KEYS.BAGS,
    queryFn: () => bagService.getBags(page, limit),
    select: (res) => res.data ?? [],
  });

export const useBag = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.BAG(id),
    queryFn: () => Promise.resolve(null), // implement if detail endpoint exists
    enabled: !!id,
  });
