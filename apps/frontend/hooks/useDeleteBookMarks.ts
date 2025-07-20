import { deleteBookMarks } from "@/lib/api/bookmarks";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteBookMarks = () => {
  return useMutation({
    mutationFn: deleteBookMarks,
    onError: (error) => handleAxiosError(error),
  });
};
