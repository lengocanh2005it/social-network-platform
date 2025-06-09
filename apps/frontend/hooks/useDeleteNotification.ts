import { deleteNotification } from "@/lib/api/notifications";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useDeleteNotification = () => {
  return useMutation({
    mutationFn: deleteNotification,
    onError: (error) => handleAxiosError(error),
  });
};
