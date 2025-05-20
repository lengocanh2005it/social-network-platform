import { verifyEmail } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import {
  handleAxiosError,
  VerifyEmailActionEnum,
  VerifyEmailDto,
} from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useVerifyEmail = () => {
  const router = useRouter();
  const { setIsModalOTPOpen } = useAppStore();

  return useMutation({
    mutationFn: (data: VerifyEmailDto) => verifyEmail(data),
    onSuccess: async (data: any, variables) => {
      if (
        variables.action === VerifyEmailActionEnum.SIGN_UP &&
        data &&
        data?.authorization_code &&
        data?.message &&
        data?.is_verified
      ) {
        toast.success(data.message);
        setIsModalOTPOpen(false);
        router.push(
          `/auth/verify-success/?authorization_code=${data.authorization_code}`,
        );
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
