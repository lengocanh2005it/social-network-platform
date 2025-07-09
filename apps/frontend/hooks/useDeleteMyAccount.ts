import { deleteMyAccount } from "@/lib/api/users";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteMyAccount = () => {
  return useMutation({
    mutationFn: deleteMyAccount,
    onError: (error) => handleAxiosError(error),
  });
};
