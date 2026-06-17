import { api } from "../lib/axios";

export const bagService = {
  getBags: async (page = 1, limit = 10) => {
    const res = await api.get("/bags", { params: { page, limit } });
    return res.data;
  },

  createBag: async (data: { bagCode?: string }) => {
    const res = await api.post("/bags", data);
    return res.data;
  },

  assignPackageToBag: async (bagId: string, packageId: string) => {
    const res = await api.post(`/bags/${bagId}/packages/${packageId}`);
    return res.data;
  },
};
