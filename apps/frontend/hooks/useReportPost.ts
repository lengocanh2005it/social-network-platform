import { reportPost } from "@/lib/api/posts";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useReportPost = () => {
  return useMutation({
    mutationFn: reportPost,
    onError: (err) => handleAxiosError(err),
  });
};
