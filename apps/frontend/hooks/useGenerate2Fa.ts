import { generate2Fa } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useGenerate2Fa = () => {
  const {
    setIsVerifiedFor2FA,
    setAccountOwnershipOtp,
    setMethod,
    setQrCodeDataUrl,
  } = useAppStore();

  return useMutation({
    mutationFn: generate2Fa,
    onSuccess: (data: any) => {
      if (
        data &&
        typeof data?.qrCodeDataUrl === "string" &&
        typeof data?.otpAuthUrl === "string"
      ) {
        setIsVerifiedFor2FA(true);
        setAccountOwnershipOtp("");
        setMethod(null);
        setQrCodeDataUrl(data.qrCodeDataUrl);
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
