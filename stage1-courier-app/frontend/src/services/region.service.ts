import axios from "axios";

interface Region {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

interface ApiResponse<T> {
  error: {
    code: string;
    message: string;
  } | null;
  message: string;
  data: T | null;
}

const logisticsApiUrl = import.meta.env.VITE_LOGISTICS_API_URL || "http://localhost:3002";
const logisticsApi = axios.create({ baseURL: logisticsApiUrl });

export const regionService = {
  getRegions: async (): Promise<Region[]> => {
    const res = await logisticsApi.get<ApiResponse<Region[]>>("/regions");
    return res.data.data ?? [];
  },
};
