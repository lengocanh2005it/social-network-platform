import { oAuthCallback } from "@/lib/api/auth";
import { OAuthCallbackDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useOAuthCallback = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: OAuthCallbackDto) => oAuthCallback(data),
    onSuccess: (data) => {
      if (data && data?.access_token && data?.refresh_token && data?.role) {
        toast.success("Successfully logged in!");

        router.push("/home");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
