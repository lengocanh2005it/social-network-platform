import axios from "@/lib/axios";
import {
  CreateFriendRequestType,
  GetFeedQueryDto,
  GetUserQueryDto,
  ResponseFriendRequestType,
  UpdateUserProfile,
} from "@/utils";

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

export const getMyFeed = async (
  username: string,
  getFeedQueryDto?: GetFeedQueryDto,
) => {
  const response = await axios.get("/users/feed", {
    params: {
      getFeedQueryDto,
      username,
    },
  });

  return response.data;
};

export const getProfile = async (
  username: string,
  getUserQueryDto?: GetUserQueryDto,
) => {
  const response = await axios.get(`/users/usernames/${username}`, {
    params: getUserQueryDto,
  });

  return response.data;
};

export const createFriendRequest = async (
  createFriendRequestDto: CreateFriendRequestType,
) => {
  const response = await axios.post(`/friends`, createFriendRequestDto);

  return response.data;
};

export const deleteFriendRequest = async (target_id: string) => {
  const response = await axios.delete("/friends", {
    params: {
      targetId: target_id,
    },
  });

  return response.data;
};

export const responseToFriendRequest = async (
  responseFriendRequestDto: ResponseFriendRequestType,
) => {
  const response = await axios.patch("/friends", responseFriendRequestDto);

  return response.data;
};
