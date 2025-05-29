import { deleteFriendRequest } from "@/lib/api/users";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteFriendRequest = () => {
  return useMutation({
    mutationFn: deleteFriendRequest,
    onError: (error) => handleAxiosError(error),
  });
};
