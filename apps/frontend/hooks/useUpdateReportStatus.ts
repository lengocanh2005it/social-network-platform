import { updateReportStatus } from "@/lib/api/admin";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateReportStatus = () => {
  return useMutation({
    mutationFn: updateReportStatus,
    onError: (error) => handleAxiosError(error),
  });
};
