import { createStory } from "@/lib/api/stories";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateStory = () => {
  return useMutation({
    mutationFn: createStory,
    onError: (error) => handleAxiosError(error),
  });
};
