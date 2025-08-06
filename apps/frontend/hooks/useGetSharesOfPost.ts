import { getSharesOfPost } from "@/lib/api/admin";
import { GetSharesPostQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetSharesOfPost = (
  userId: string,
  postId: string,
  getSharesPostQueryDto: GetSharesPostQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/${postId}/shares`],
    queryFn: () => getSharesOfPost(postId, getSharesPostQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId && !!postId,
  });
};
