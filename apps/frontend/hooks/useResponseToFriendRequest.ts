import { responseToFriendRequest } from "@/lib/api/users";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useResponseToFriendRequest = () => {
  return useMutation({
    mutationFn: responseToFriendRequest,
    onError: (error) => handleAxiosError(error),
  });
};
