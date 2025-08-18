import { signOut } from "@/lib/api/auth";
import { useUserStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useSignOut = () => {
  const { setUser } = useUserStore();
  const router = useRouter();

  return useMutation({
    mutationFn: signOut,
    onSuccess: (data: any) => {
      if (data && data?.message) {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie =
            name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        toast.success(data.message, {
          position: "bottom-right",
        });
        setTimeout(() => {
          setUser(null);
        }, 1000);
        router.push("/auth/sign-in");
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
