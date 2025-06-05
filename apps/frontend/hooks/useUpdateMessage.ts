import { updateMessage } from "@/lib/api/conversations";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateMessage = () => {
  return useMutation({
    mutationFn: updateMessage,
    onError: (error) => handleAxiosError(error),
  });
};
