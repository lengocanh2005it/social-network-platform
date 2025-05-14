import { verify2Fa } from "@/lib/api/auth";
import { getMe } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import { handleAxiosError, Verify2FaType } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useVerify2Fa = () => {
  const {
    setIs2FAEnabled,
    setIs2FAModalOpen,
    setOtp2FaVerified,
    setMethod,
    setIsVerifiedFor2FA,
  } = useAppStore();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (verify2FaDto: Verify2FaType) => verify2Fa(verify2FaDto),
    onSuccess: async (data: any) => {
      if (
        data &&
        data?.success === true &&
        data?.message?.length &&
        data?.is2FAEnabled === true
      ) {
        setIs2FAModalOpen(false);
        setOtp2FaVerified("");
        setMethod(null);
        setIsVerifiedFor2FA(false);

        toast.success(data?.message, {
          position: "bottom-right",
        });

        const res = await getMe({
          includeProfile: true,
          includeEducations: true,
          includeWorkPlaces: true,
          includeSocials: true,
        });

        if (res) setUser(res);
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
