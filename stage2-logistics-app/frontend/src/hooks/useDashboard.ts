import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { ApiResponse, DashboardData } from "../types/package.types";

export const useDashboard = () =>
  useQuery<DashboardData | null>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardData>>("/dashboard");
      return response.data.data;
    },
  });
