import { getPostsDashboard } from "@/lib/api/admin";
import { GetPostsDashboardQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetPostsDashboard = (
  userId: string,
  getPostsDashboardQueryDto: GetPostsDashboardQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/posts/dashboard`],
    queryFn: () => getPostsDashboard(getPostsDashboardQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
