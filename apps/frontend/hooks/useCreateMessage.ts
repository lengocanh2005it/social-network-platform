import { createMessage } from "@/lib/api/conversations";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateMessage = () => {
  return useMutation({
    mutationFn: createMessage,
    onError: (error) => handleAxiosError(error),
  });
};
