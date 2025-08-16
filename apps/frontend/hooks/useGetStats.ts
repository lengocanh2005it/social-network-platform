import { getStats } from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useGetStats = (userId: string) => {
  return useQuery({
    queryKey: [`${userId}/stats`],
    queryFn: getStats,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });
};
