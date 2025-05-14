import { signIn } from "@/lib/api/auth";
import { getMe } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { handleAxiosError, SignInDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useSignIn = () => {
  const router = useRouter();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: SignInDto) => signIn(data),
    onSuccess: async (data: any) => {
      if (!data) throw new Error("Login failed. Please try again.");

      const response = await getMe({
        includeProfile: true,
        includeEducations: true,
        includeWorkPlaces: true,
        includeSocials: true,
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
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
