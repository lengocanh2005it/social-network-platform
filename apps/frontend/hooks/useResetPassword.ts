import { resetPassword } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import { handleAxiosError, ResetPasswordDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useResetPassword = () => {
  const { setIsPasswordResetSuccess } = useAppStore();

  return useMutation({
    mutationFn: (resetPasswordDto: ResetPasswordDto) =>
      resetPassword(resetPasswordDto),
    onSuccess: (data: any) => {
      toast.success(data?.message || "Success");
      setIsPasswordResetSuccess(true);
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
