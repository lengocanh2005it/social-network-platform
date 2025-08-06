import { getStoriesDashboard } from "@/lib/api/admin";
import { GetStoriesDashboardQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetStoriesDashboard = (
  userId: string,
  query: GetStoriesDashboardQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/dashboard/stories`, JSON.stringify(query)],
    queryFn: () => getStoriesDashboard(query),
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
