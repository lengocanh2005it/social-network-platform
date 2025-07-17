import { verify2Fa } from "@/lib/api/auth";
import { getMe } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import { handleAxiosError, Verify2FaActionEnum } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const useVerify2Fa = () => {
  const {
    setIs2FAModalOpen,
    setOtp2FaVerified,
    setMethod,
    setIsVerifiedFor2FA,
  } = useAppStore();
  const { setUser, user } = useUserStore();
  const router = useRouter();

  return useMutation({
    mutationFn: verify2Fa,
    onSuccess: async (data: any, variables) => {
      const { action } = variables;

      if (
        action === Verify2FaActionEnum.ENABLE_2FA ||
        action === Verify2FaActionEnum.DISABLE_2FA
      ) {
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

          if (user?.profile) {
            const res = await getMe({
              includeProfile: true,
              includeEducations: true,
              includeWorkPlaces: true,
              includeSocials: true,
              username: user.profile.username,
            });

            if (res) setUser(res);
          }
        }
      }

      if (action === Verify2FaActionEnum.SIGN_IN) {
        if (
          data &&
          data?.access_token &&
          data?.refresh_token &&
          data?.role &&
          data?.username
        ) {
          const response = await getMe({
            includeProfile: true,
            includeEducations: true,
            includeWorkPlaces: true,
            includeSocials: true,
            username: data.username,
          });

          if (response) setUser(response);

          if (data?.role === "user") {
            router.push("/home");
          } else if (data?.role === "admin") {
            router.push("/home/dashboard");
          }

          toast.success("Successfully logged in!", {
            position: "bottom-right",
          });
        }
      }

      if (action === Verify2FaActionEnum.DISABLE_2FA) {
        if (user?.profile) {
          const updatedUserData = await getMe({
            includeProfile: true,
            includeEducations: true,
            includeWorkPlaces: true,
            includeSocials: true,
            username: user.profile.username,
          });

          if (updatedUserData) setUser(updatedUserData);

          toast.success(
            "Two-factor authentication has been disabled. Your account is now less secure.",
            {
              position: "bottom-right",
            },
          );
        }
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
