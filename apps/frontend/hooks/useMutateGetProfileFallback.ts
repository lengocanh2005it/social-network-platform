import { useGetProfileFallback } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";

export const useMutateGetProfileFallback = () => {
  return useMutation({
    mutationFn: useGetProfileFallback,
  });
};
