import { verifyEmail } from "@/lib/api/auth";
import { handleAxiosError, VerifyEmailDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: VerifyEmailDto) => verifyEmail(data),
    onSuccess: (data: any) => {
      if (data && data.authorization_code && data.message) {
        toast.success(data.message || "Success");

        router.push(
          `/auth/verify-success/?authorization_code=${data.authorization_code}`,
        );
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
