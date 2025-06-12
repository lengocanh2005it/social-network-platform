import { getPostOfUser } from "@/lib/api/posts";
import { useQuery } from "@tanstack/react-query";

export const useGetPostOfUser = (
  currentUserId: string,
  username: string,
  postId: string
) => {
  return useQuery({
    queryKey: [`${currentUserId}/posts/${postId}?username=${username}`],
    queryFn: () => getPostOfUser(username, postId),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!currentUserId && !!username && !!postId,
  });
};
