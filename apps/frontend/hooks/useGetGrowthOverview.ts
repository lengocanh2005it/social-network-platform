import { getGrowthOverview } from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useGetGrowthOverview = (userId: string) => {
  return useQuery({
    queryKey: [`${userId}/growth/overview`],
    queryFn: getGrowthOverview,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });
};
