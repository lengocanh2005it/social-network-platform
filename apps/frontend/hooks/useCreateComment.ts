import { createComment } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateComment = () => {
  return useMutation({
    mutationFn: createComment,
    onError: (error) => handleAxiosError(error),
  });
};
