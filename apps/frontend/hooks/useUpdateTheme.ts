import { updateThemeOfUser } from "@/lib/api/users";
import { FullUserType, useUserStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

export const useUpdateTheme = () => {
  const { setUser } = useUserStore();
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: updateThemeOfUser,
    onSuccess: (data: FullUserType) => {
      if (data) {
        setUser(data);
        setTheme(data.profile.theme);
        toast.success("Theme updated successfully.", {
          position: "bottom-right",
        });
      }
    },
    onError: (error) => handleAxiosError(error),
  });
};
