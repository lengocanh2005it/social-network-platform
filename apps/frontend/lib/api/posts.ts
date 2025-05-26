import axios from "@/lib/axios";
import {
  CreateCommentDto,
  CreatePostDto,
  DeleteCommentDto,
  GetCommentLikeQueryDto,
  GetCommentQueryDto,
  GetCommentRepliesQueryDto,
  GetFeedQueryDto,
  UpdatePostType,
} from "@/utils";

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

export const likePost = async (postId: string) => {
  const response = await axios.post(`/posts/${postId}/like`);

  return response.data;
};

export const unlikePost = async (postId: string) => {
  const response = await axios.delete(`/posts/${postId}/like`);

  return response.data;
};

export const getPostLikes = async (
  postId: string,
  getUserLikesQueryDto?: GetFeedQueryDto,
) => {
  const response = await axios.get(`/posts/${postId}/likes`, {
    params: getUserLikesQueryDto,
  });

  return response.data;
};

export const createComment = async (createCommentDto: CreateCommentDto) => {
  const { post_id, ...res } = createCommentDto;

  const response = await axios.post(`/posts/${post_id}/comment`, res);

  return response.data;
};

export const getComments = async (
  postId: string,
  getCommentQueryDto?: GetCommentQueryDto,
) => {
  const response = await axios.get(`/posts/${postId}/comments`, {
    params: getCommentQueryDto,
  });

  return response.data;
};

export const deleteComment = async (deleteCommentDto: DeleteCommentDto) => {
  const { postId, commentId } = deleteCommentDto;

  const response = await axios.delete(`/posts/${postId}/comments/${commentId}`);

  return response.data;
};

export const getCommentReplies = async (
  postId: string,
  commentId: string,
  getCommentRepliesQueryDto?: GetCommentRepliesQueryDto,
) => {
  const response = await axios.get(
    `/posts/${postId}/comments/${commentId}/replies`,
    {
      params: getCommentRepliesQueryDto,
    },
  );

  return response.data;
};

export const likeComment = async (likeCommentDto: {
  postId: string;
  commentId: string;
}) => {
  const { postId, commentId } = likeCommentDto;

  const response = await axios.post(
    `/posts/${postId}/comments/${commentId}/like`,
  );

  return response.data;
};

export const unlikeComment = async (unlikeCommentDto: {
  postId: string;
  commentId: string;
}) => {
  const { postId, commentId } = unlikeCommentDto;

  const response = await axios.delete(
    `/posts/${postId}/comments/${commentId}/like`,
  );

  return response.data;
};

export const getLikesOfComment = async (
  postId: string,
  commentId: string,
  getCommentLikeQueryDto?: GetCommentLikeQueryDto,
) => {
  const response = await axios.get(
    `/posts/${postId}/comments/${commentId}/likes`,
    {
      params: getCommentLikeQueryDto,
    },
  );

  return response.data;
};
