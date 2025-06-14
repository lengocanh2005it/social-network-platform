import { getStory } from "@/lib/api/stories";
import { useQuery } from "@tanstack/react-query";

export const useGetStory = (storyId: string, userId: string) => {
  return useQuery({
    queryKey: [`${userId}/views/stories/${storyId}`],
    queryFn: () => getStory(storyId),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!storyId && !!userId,
  });
};
