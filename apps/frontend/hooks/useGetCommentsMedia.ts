import { getCommentsOfMedia } from "@/lib/api/posts";
import { GetCommentMediaQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetCommentsMedia = (
  postId: string,
  mediaId: string,
  getCommentMediaQueryDto: GetCommentMediaQueryDto,
) => {
  return useQuery({
    queryKey: [`posts/${postId}/media/${mediaId}/comments`],
    queryFn: () => getCommentsOfMedia(postId, mediaId, getCommentMediaQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!postId && !!mediaId,
  });
};
