import { updateUserProfile } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import { handleAxiosError, UpdateUserProfile } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useUpdateProfile = () => {
  const {
    setUser,
    clearEducationsHistory,
    clearWorkPlacesHistory,
    resetUserEducations,
    resetUserWorkPlaces,
  } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();

  return useMutation({
    mutationFn: (updateUserProfileDto: UpdateUserProfile) =>
      updateUserProfile(updateUserProfileDto),
    onSuccess: (data: any) => {
      if (data) {
        setUser(data);
        setIsModalEditProfileOpen(false);
        clearEducationsHistory();
        clearWorkPlacesHistory();
        resetUserEducations();
        resetUserWorkPlaces();
        toast.success("Your profile updated successfully!", {
          position: "bottom-right",
        });
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
