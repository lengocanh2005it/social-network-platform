import { unblockUser } from "@/lib/api/users";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUnblockUser = () => {
  return useMutation({
    mutationFn: unblockUser,
    onError: (error) => handleAxiosError(error),
  });
};
