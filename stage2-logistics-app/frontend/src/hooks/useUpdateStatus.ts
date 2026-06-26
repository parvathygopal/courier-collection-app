import { useMutation, useQueryClient } from "@tanstack/react-query";
import { packageService } from "../services/package.service";
import { QUERY_KEYS } from "../constants/queryKey";

export const useUpdateStatus = (trackingId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => packageService.updateStatus(trackingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PACKAGE(trackingId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PACKAGES });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY(trackingId) });
    },
  });
};
