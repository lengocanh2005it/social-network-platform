import { getViewersOfStory } from "@/lib/api/stories";
import { GetStoryViewersQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetViewersOfStory = (
  userId: string,
  storyId: string,
  getStoryViewersQueryDto?: GetStoryViewersQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/stories/${storyId}/viewers`],
    queryFn: () => getViewersOfStory(storyId, getStoryViewersQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
