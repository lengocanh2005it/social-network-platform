import { updateStoryStatus } from "@/lib/api/admin";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateStoryStatus = () => {
  return useMutation({
    mutationFn: updateStoryStatus,
    onError: (err) => handleAxiosError(err),
  });
};
