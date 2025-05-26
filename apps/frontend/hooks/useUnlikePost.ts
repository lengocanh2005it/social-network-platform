import { unlikePost } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUnlikePost = () => {
  return useMutation({
    mutationFn: unlikePost,
    onError: (error) => handleAxiosError(error),
  });
};
