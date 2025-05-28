import { unlikeComment } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUnlikeComment = () => {
  return useMutation({
    mutationFn: unlikeComment,
    onError: (error) => handleAxiosError(error),
  });
};
