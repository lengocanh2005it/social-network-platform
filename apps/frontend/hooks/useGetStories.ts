import { getStories } from "@/lib/api/stories";
import { GetStoryQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetStories = (
  userId: string,
  getStoryQueryDto?: GetStoryQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/stories`],
    queryFn: () => getStories(getStoryQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
