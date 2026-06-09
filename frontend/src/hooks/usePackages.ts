import { useQuery } from "@tanstack/react-query";
import { packageService } from "../services/package.service";

export const usePackages = () =>
  useQuery({
    queryKey: ["packages"],
    queryFn: packageService.getPackages,
  });
