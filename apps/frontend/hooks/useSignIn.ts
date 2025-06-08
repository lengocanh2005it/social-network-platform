import { useSocket } from "@/hooks";
import { signIn } from "@/lib/api/auth";
import { getMe } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import { handleAxiosError, SignInDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useSignIn = () => {
  const router = useRouter();
  const { setUser } = useUserStore();
  const { setIs2FAModalOpen, setIsModalOTPOpen } = useAppStore();

  return useMutation({
    mutationFn: (data: SignInDto) => signIn(data),
    onSuccess: async (data: any) => {
      if (!data) throw new Error("Login failed. Please try again.");

      if (
        data?.requires2FA &&
        data?.["2faToken"] &&
        data?.message?.includes("Two-factor authentication required")
      ) {
        setIs2FAModalOpen(true);
        return;
      }

      if (
        !data?.is_verified &&
        data?.message?.includes(
          "We've sent you a verification code. Please check your email inbox.",
        )
      ) {
        setIsModalOTPOpen(true);
        toast.success(
          `Your account needs verification. Please check your email for the code.`,
        );
        return;
      }

      if (
        data &&
        !data?.is_verified &&
        data?.verification_method &&
        data?.message
      )
        return;

      if (data?.username) {
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
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
