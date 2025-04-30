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
      if (data?.role === "user") {
        router.push("/home");
      } else if (data?.role === "admin") {
        router.push("/home/dashboard");
      }

      toast.success("Successfully logged in!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
