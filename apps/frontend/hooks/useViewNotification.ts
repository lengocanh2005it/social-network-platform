import { viewNotification } from "@/lib/api/notifications";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useViewNotification = () => {
  return useMutation({
    mutationFn: viewNotification,
    onError: (error) => handleAxiosError(error),
  });
};
