import { likePost } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useLikePost = () => {
  return useMutation({
    mutationFn: likePost,
    onError: (error) => handleAxiosError(error),
  });
};
