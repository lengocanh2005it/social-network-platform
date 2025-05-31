import { blockUser } from "@/lib/api/users";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useBlockUser = () => {
  return useMutation({
    mutationFn: blockUser,
    onError: (error) => handleAxiosError(error),
  });
};
