import { forgotPassword } from "@/lib/api/auth";
import { ForgotPasswordDto, handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => forgotPassword(data),
    onSuccess: (data: any) => {
      toast.success(data?.message || "Success");
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
