import { deleteComment } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteComment = () => {
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (data: any) => ({}),
    onError: (error) => handleAxiosError(error),
  });
};
