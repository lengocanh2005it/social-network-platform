import { changePassword } from "@/lib/api/auth";
import { ChangePasswordDto, handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useChangePassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (changePasswordDto: ChangePasswordDto) =>
      changePassword(changePasswordDto),
    onSuccess: (data: any) => {
      if (data) {
        toast.success(data?.message, {
          position: "bottom-right",
        });
        router.push("/home");
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
