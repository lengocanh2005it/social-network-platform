import axios from "@/lib/axios";
import { CreatePostDto, GetFeedQueryDto, UpdatePostType } from "@/utils";

export const createPost = async (createPostDto: CreatePostDto) => {
  const response = await axios.post("/posts", createPostDto);

  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await axios.delete(`/posts/${postId}`);

  return response.data;
};

export const updatePost = async (updatePostType: UpdatePostType) => {
  const { postId, updatePostDto } = updatePostType;

  const response = await axios.patch(`/posts/${postId}`, updatePostDto);

  return response.data;
};

export const getHomePosts = async (getFeedQueryDto?: GetFeedQueryDto) => {
  const response = await axios.get("/posts", {
    params: getFeedQueryDto,
  });

  return response.data;
};
