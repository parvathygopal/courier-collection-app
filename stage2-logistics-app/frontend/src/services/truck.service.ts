import { api } from "../lib/axios";

export const truckService = {
  getTrucks: async (page = 1, limit = 10) => {
    const res = await api.get("/trucks", { params: { page, limit } });
    return res.data;
  },

  createTruck: async (data: { registrationNumber?: string }) => {
    const res = await api.post("/trucks", data);
    return res.data;
  },

  assignBagToTruck: async (truckId: string, bagId: string) => {
    const res = await api.post(`/trucks/${truckId}/bags/${bagId}`);
    return res.data;
  },
};
