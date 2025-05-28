import { likeMediaOfPost } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useLikeMediaPost = () => {
  return useMutation({
    mutationFn: likeMediaOfPost,
    onError: (error) => handleAxiosError(error),
  });
};
