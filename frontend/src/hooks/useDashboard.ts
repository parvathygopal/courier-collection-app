import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get("/dashboard");
      return response.data;
    },
  });
