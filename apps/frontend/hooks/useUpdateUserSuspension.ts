import { updateUserSuspension } from "@/lib/api/admin";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUserSuspension = () => {
  return useMutation({
    mutationFn: updateUserSuspension,
    onError: (error) => handleAxiosError(error),
  });
};
