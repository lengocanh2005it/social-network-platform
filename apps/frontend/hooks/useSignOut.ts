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
        localStorage.removeItem("user-storage");
        localStorage.removeItem("app-storage");
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
