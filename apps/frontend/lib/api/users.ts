import axios from "@/lib/axios";
import {
  BlockUserType,
  CreateFriendRequestType,
  GetBlockedUsersListQueryDto,
  GetFeedQueryDto,
  GetFriendRequestsQueryDto,
  GetFriendsListQueryDto,
  GetUserQueryDto,
  ResponseFriendRequestType,
  SearchUserQueryDto,
  UpdateUserProfile,
} from "@/utils";

export const getMe = async (getUserQueryDto: GetUserQueryDto) => {
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
      ...(getFeedQueryDto?.after && { after: getFeedQueryDto.after }),
      username,
    },
  });

  return response.data;
};

export const getProfile = async (
  username: string,
  getUserQueryDto: GetUserQueryDto,
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

export const getFriendRequests = async (
  getFriendRequestsQueryDto?: GetFriendRequestsQueryDto,
) => {
  const response = await axios.get("/friends/requests", {
    params: getFriendRequestsQueryDto,
  });

  return response.data;
};

export const getFriendsList = async (
  getFriendsListQueryDto: GetFriendsListQueryDto,
) => {
  const response = await axios.get("/friends", {
    params: getFriendsListQueryDto,
  });

  return response.data;
};

export const blockUser = async (blockUserType: BlockUserType) => {
  const { targetId } = blockUserType;

  const response = await axios.delete(`/users/blocks/${targetId}`);

  return response.data;
};

export const getBlockedUsersList = async (
  getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
) => {
  const response = await axios.get(`/users/me/blocked`, {
    params: getBlockedUsersListQueryDto,
  });

  return response.data;
};

export const unblockUser = async (targetId: string) => {
  const response = await axios.delete(`/users/me/blocked/${targetId}`);

  return response.data;
};

export const getUsers = async (searchUserQueryDto: SearchUserQueryDto) => {
  const response = await axios.get(`/users`, {
    params: searchUserQueryDto,
  });

  return response.data;
};
