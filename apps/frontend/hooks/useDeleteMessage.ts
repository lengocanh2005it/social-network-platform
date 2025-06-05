import { deleteMessage } from "@/lib/api/conversations";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteMessage = () => {
  return useMutation({
    mutationFn: deleteMessage,
    onError: (error) => handleAxiosError(error),
  });
};
