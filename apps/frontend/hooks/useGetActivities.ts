import { getActivities } from "@/lib/api/admin";
import { GetActivitiesQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetActivities = (
  userId: string,
  getActivitiesQueryDto: GetActivitiesQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/activities`],
    queryFn: () => getActivities(getActivitiesQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
