import { updatePostStatus } from "@/lib/api/admin";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdatePostStatus = () => {
  return useMutation({
    mutationFn: updatePostStatus,
    onError: (error) => handleAxiosError(error),
  });
};
