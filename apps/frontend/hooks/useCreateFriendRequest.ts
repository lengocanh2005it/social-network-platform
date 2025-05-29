import { createFriendRequest } from "@/lib/api/users";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateFriendRequest = () => {
  return useMutation({
    mutationFn: createFriendRequest,
    onError: (error) => handleAxiosError(error),
  });
};
