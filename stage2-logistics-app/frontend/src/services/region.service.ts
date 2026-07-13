import { api } from "../lib/axios";
import type { ApiResponse, Region } from "../types/package.types";

export const regionService = {
  getRegions: async () => {
    const res = await api.get<ApiResponse<Region[]>>("/regions");
    return res.data;
  },
};
