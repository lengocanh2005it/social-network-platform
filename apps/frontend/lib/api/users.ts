import axios from "@/lib/axios";
import { GetUserQueryDto, UpdateUserProfile } from "@/utils";

export const getMe = async (getUserQueryDto?: GetUserQueryDto) => {
  const response = await axios.get("/users/me", {
    params: getUserQueryDto,
  });

  return response.data;
};

export const updateUserProfile = async (
  updateUserProfileDto: UpdateUserProfile,
) => {
  const response = await axios.patch("/users/me", updateUserProfileDto);

  return response.data;
};
