import { getUsersDashboard } from "@/lib/api/admin";
import { GetUsersDashboardQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetUsersDashboard = (
  userId: string,
  getUsersDashboardQueryDto: GetUsersDashboardQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/users/dashboard`],
    queryFn: () => getUsersDashboard(getUsersDashboardQueryDto),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!userId,
  });
};
