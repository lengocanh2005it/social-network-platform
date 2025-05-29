import { updateUserProfile } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import { handleAxiosError, UpdateUserProfile } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export const useUpdateProfile = () => {
  const {
    setUser,
    clearEducationsHistory,
    clearWorkPlacesHistory,
    resetUserEducations,
    resetUserWorkPlaces,
  } = useUserStore();
  const { setIsModalEditProfileOpen } = useAppStore();
  const router = useRouter();
  const { user } = useUserStore();

  return useMutation({
    mutationFn: (updateUserProfileDto: UpdateUserProfile) =>
      updateUserProfile(updateUserProfileDto),
    onSuccess: (data: any) => {
      if (data) {
        if (data?.profile?.username !== user?.profile.username) {
          router.push(`/profile/${data.profile.username}`);
        }
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
