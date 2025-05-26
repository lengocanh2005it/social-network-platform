import { getComments } from "@/lib/api/posts";
import { GetCommentQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetComments = (
  postId: string,
  getCommentQueryDto?: GetCommentQueryDto,
) => {
  return useQuery({
    queryKey: [`${postId}/comments`],
    queryFn: () => getComments(postId, getCommentQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
