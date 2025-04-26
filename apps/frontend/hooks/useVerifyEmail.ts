import { verifyEmail } from "@/lib/api/auth";
import { VerifyEmailDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (data: VerifyEmailDto) => verifyEmail(data),
    onSuccess: (data: any) => {},
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
