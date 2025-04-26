import { signIn } from "@/lib/api/auth";
import { SignInDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useSignIn = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignInDto) => signIn(data),
    onSuccess: (data: any) => {
      localStorage.setItem("accessToken", data?.access_token);

      if (data?.role.includes("user")) {
        router.push("/home");
      } else if (data?.role.includes("admin")) {
        router.push("/home/dashboard");
      }

      toast.success("Successfully logged in!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
