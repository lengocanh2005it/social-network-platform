import { getHomePosts } from "@/lib/api/posts";
import { GetFeedQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetPosts = (getFeedQueryDto?: GetFeedQueryDto) => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: () => getHomePosts(getFeedQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
