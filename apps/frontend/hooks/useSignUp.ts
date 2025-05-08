import { signUp } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import { handleAxiosError, SignUpDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useSignUp = () => {
  const { setIsModalOTPOpen } = useAppStore();

  return useMutation({
    mutationFn: (data: SignUpDto) => signUp(data),
    onSuccess: (data: any) => {
      if (data) {
        toast.success(data?.message);

        setIsModalOTPOpen(true);
      }
    },
    onError: (error: any) => {
      setIsModalOTPOpen(false);
      handleAxiosError(error);
    },
  });
};
