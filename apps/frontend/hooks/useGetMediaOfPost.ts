import { getMediaOfPost } from "@/lib/api/posts";
import { useQuery } from "@tanstack/react-query";

export const useGetMediaOfPost = (
  postId: string,
  mediaId: string,
  type: "video" | "image",
) => {
  return useQuery({
    queryKey: [`posts/${postId}/media/${mediaId}`],
    queryFn: () => getMediaOfPost(postId, mediaId, type),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!postId && !!mediaId,
  });
};
