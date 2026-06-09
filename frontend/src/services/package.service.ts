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
    const response = await api.get(`/packages/${trackingId}/history`);

    return response.data.data;
  },

  updateStatus: async (trackingId: string) => {
    const response = await api.patch(`/packages/${trackingId}/status`);

    return response.data.data;
  },
};
