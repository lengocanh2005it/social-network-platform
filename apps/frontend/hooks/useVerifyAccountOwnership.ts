import { verifyAccountOwnership } from "@/lib/api/auth";
import { updateUserProfile } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import {
  formatDateToString,
  handleAxiosError,
  TempUserUpdateType,
  UpdateUserProfile,
  VerifyOwnershipOtpType,
} from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useVerifyAccountOwnership = (
  tempUserUpdateDto: TempUserUpdateType,
) => {
  const {
    setUser,
    clearEducationsHistory,
    clearWorkPlacesHistory,
    resetUserEducations,
    resetUserWorkPlaces,
  } = useUserStore();
  const { setIsModalEditProfileOpen, setIsDifferentPhoneNumber } =
    useAppStore();

  return useMutation({
    mutationFn: (verifyAccountOwnershipDto: VerifyOwnershipOtpType) =>
      verifyAccountOwnership(verifyAccountOwnershipDto),
    onSuccess: async (data: any) => {
      if (data && data?.success === true && data?.message) {
        const {
          dob,
          first_name,
          last_name,
          nick_name,
          address,
          phone_number,
          gender,
        } = tempUserUpdateDto;

        const updateUserProfileData: UpdateUserProfile = {
          infoDetails: {
            dob: formatDateToString(dob),
            first_name,
            last_name,
            nickname:
              typeof nick_name === "string" && nick_name?.trim() !== ""
                ? nick_name
                : undefined,
            address,
            phone_number,
            gender,
          },
        };

        const res = await updateUserProfile(updateUserProfileData);

        if (res) {
          setUser(res);
          localStorage.removeItem("otp-last-requested");
          setIsDifferentPhoneNumber(false);
          setIsModalEditProfileOpen(false);
          clearEducationsHistory();
          clearWorkPlacesHistory();
          resetUserEducations();
          resetUserWorkPlaces();
          toast.success("Your profile updated successfully!", {
            position: "bottom-right",
          });
        }
      }
    },
    onError: (error: any) => handleAxiosError(error),
  });
};
