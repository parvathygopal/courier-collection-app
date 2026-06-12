import { useMutation, useQueryClient } from "@tanstack/react-query";
import { packageService } from "../services/package.service";
import { QUERY_KEYS } from "../constants/queryKey";

export const useUpdateStatus = (trackingId: string) => {
  const qc = useQueryClient();

  // Let TypeScript infer generics to avoid overload/type mismatch
  // Use the options-object form to avoid overload ambiguity and ensure correct types
  return useMutation({
    mutationFn: (location?: string) =>
      packageService.updateStatus(trackingId, location),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PACKAGE(trackingId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PACKAGES });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY(trackingId) });
    },
  });
};
