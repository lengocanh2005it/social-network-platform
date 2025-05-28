import { unlikeMediaOfPost } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUnlikeMediaPost = () => {
  return useMutation({
    mutationFn: unlikeMediaOfPost,
    onError: (error) => handleAxiosError(error),
  });
};
