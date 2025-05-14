import { sendOtp } from "@/lib/api/auth";
import { handleAxiosError, SendOtpType } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (sendOtpDto: SendOtpType) => sendOtp(sendOtpDto),
    onSuccess: (data: any) => {
      if (data)
        toast.success(
          "We have sent a verification code to your phone number. Please check your messages.",
        );
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
