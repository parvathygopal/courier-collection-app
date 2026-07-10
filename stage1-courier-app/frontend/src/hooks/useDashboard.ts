import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { DashboardData } from "../types/package.types";

export const useDashboard = () =>
  useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get("/dashboard");
      return response.data.data;
    },
  });
