import { createPostShare } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreatePostShare = () => {
  return useMutation({
    mutationFn: createPostShare,
    onError: (error) => handleAxiosError(error),
  });
};
