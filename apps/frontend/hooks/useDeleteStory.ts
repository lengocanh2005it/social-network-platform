import { deleteStory } from "@/lib/api/stories";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteStory = () => {
  return useMutation({
    mutationFn: deleteStory,
    onError: (error) => handleAxiosError(error),
  });
};
