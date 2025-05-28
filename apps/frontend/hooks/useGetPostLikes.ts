import { getPostLikes } from "@/lib/api/posts";
import { GetFeedQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetPostLikes = (
  postId: string,
  getUserLikesQueryDto?: GetFeedQueryDto,
) => {
  return useQuery({
    queryKey: [`${postId}/likes`],
    queryFn: () => getPostLikes(postId, getUserLikesQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
