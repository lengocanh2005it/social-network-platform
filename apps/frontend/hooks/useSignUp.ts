import { signUp } from "@/lib/api/auth";
import { SignUpDto } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useSignUp = () =>
  useMutation({
    mutationFn: (data: SignUpDto) => signUp(data),
    onSuccess: (data: any) => {},
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
