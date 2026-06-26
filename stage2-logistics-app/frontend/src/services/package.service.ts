import { api } from "../lib/axios";
import type {
  ApiResponse,
  Package,
  TrackingHistory,
} from "../types/package.types";

export const packageService = {
  getPackages: async () => {
    const res = await api.get<ApiResponse<Package[]>>("/packages");
    return res.data;
  },

  createPackage: async (data: any) => {
    const res = await api.post<ApiResponse<Package>>("/packages", data);
    return res.data;
  },

  getPackage: async (trackingId: string) => {
    const res = await api.get<ApiResponse<Package>>(`/packages/${trackingId}`);
    return res.data;
  },

  getHistory: async (trackingId: string) => {
    const res = await api.get<ApiResponse<TrackingHistory[]>>(
      `/packages/${trackingId}/history`,
    );
    return res.data;
  },

  updateStatus: async (trackingId: string) => {
    const res = await api.patch<ApiResponse<Package>>(
      `/packages/${trackingId}/status`,
      {},
    );
    return res.data;
  },

  assignPackageToBag: async (bagId: string, packageId: string) => {
    const res = await api.post(`/bags/${bagId}/packages/${packageId}`);
    return res.data;
  },
};
