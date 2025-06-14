import { createCommentReply } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateCommentReply = () => {
  return useMutation({
    mutationFn: createCommentReply,
    onError: (err) => handleAxiosError(err),
  });
};
