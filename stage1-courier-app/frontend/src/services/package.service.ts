import { api } from "../lib/axios";

export const packageService = {
  getPackages: async () => {
    const response = await api.get("/packages");
    return response.data.data;
  },

  getPackage: async (trackingId: string) => {
    const response = await api.get(`/packages/${trackingId}`);

    return response.data.data;
  },

  createPackage: async (payload: any) => {
    const response = await api.post("/packages", payload);

    return response.data.data;
  },

  getHistory: async (trackingId: string) => {
    const response = await api.get(`/packages/${trackingId}/tracking-history`);

    return response.data.data;
  },

  updateStatus: async (trackingId: string, location?: string) => {
    const body = location ? { location } : undefined;
    const response = await api.patch(`/packages/${trackingId}`, body);

    return response.data.data;
  },
};
