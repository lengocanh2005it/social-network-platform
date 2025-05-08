import { getInfoOAuthCallback } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import { AuthMethod, GetInfoOAuthCallbackDto, Provider } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useGetInfoOAuthCallback = () => {
  const { setOAuthNames, authMethod, setOAuthTokens, setProvider } =
    useAppStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: GetInfoOAuthCallbackDto) => getInfoOAuthCallback(data),
    onSuccess: (data: any) => {
      if (
        data?.given_name &&
        data?.family_name &&
        authMethod === AuthMethod.SIGN_UP &&
        data?.access_token &&
        data?.refresh_token &&
        data?.provider
      ) {
        setOAuthNames({
          first_name: data?.family_name,
          last_name: data?.given_name,
        });

        setOAuthTokens({
          access_token: data?.access_token,
          refresh_token: data?.refresh_token,
        });

        setProvider(data?.provider as Provider);
      }

      if (
        authMethod === AuthMethod.SIGN_IN &&
        data?.access_token &&
        data?.refresh_token
      ) {
        toast.success("Successfully logged in!");

        router.push("/home");
      }
    },
    onError: (error: any) => {
      if (!error.response) {
        toast.error("Unable to connect to the server. Please try again later.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.";

        if (errorMessage?.includes("This email has not been registered."))
          router.push("/auth/sign-in");

        if (errorMessage?.includes("This email has already been registered."))
          router.push("/auth/sign-up");

        toast.error(errorMessage);
      }
    },
  });
};
