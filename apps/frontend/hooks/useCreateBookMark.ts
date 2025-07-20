import { createBookmark } from "@/lib/api/bookmarks";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateBookMark = () => {
  return useMutation({
    mutationFn: createBookmark,
    onError: (error) => handleAxiosError(error),
  });
};
