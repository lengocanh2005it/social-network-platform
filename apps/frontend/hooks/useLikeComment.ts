import { likeComment } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useLikeComment = () => {
  return useMutation({
    mutationFn: likeComment,
    onError: (error) => handleAxiosError(error),
  });
};
