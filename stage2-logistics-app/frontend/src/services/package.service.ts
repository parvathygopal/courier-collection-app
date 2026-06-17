import { api } from "../lib/axios";

export const packageService = {
  getPackages: async () => {
    const res = await api.get("/packages");
    return res.data;
  },

  createPackage: async (data: any) => {
    const res = await api.post("/packages", data);
    return res.data;
  },

  assignPackageToBag: async (bagId: string, packageId: string) => {
    const res = await api.post(`/bags/${bagId}/packages/${packageId}`);
    return res.data;
  },
};
