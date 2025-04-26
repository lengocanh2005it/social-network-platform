import { forgotPassword } from "@/lib/api/auth";
import { ForgotPasswordDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => forgotPassword(data),
    onSuccess: (data: any) => {
      toast.success(data?.message || "Success");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
