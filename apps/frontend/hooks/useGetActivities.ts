import { getActivities } from "@/lib/api/admin";
import { GetActivitiesQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetActivities = (
  userId: string,
  query: GetActivitiesQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/activities`, query],
    queryFn: () => getActivities(query),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });
};
