import { GroupedComment } from "@/utils";
import { create } from "zustand";

interface CommentStore {
  commentsByPostId: Record<string, GroupedComment[]>;
  repliesByCommentId: Record<string, GroupedComment[]>;
  setComments: (postId: string, comments: GroupedComment[]) => void;
  addNewComments: (postId: string, comment: GroupedComment) => void;
  addOldComments: (postId: string, oldComments: GroupedComment[]) => void;
  deleteComment: (postId: string, commentId: string) => void;
  updateComment: (
    postId: string,
    commentId: string,
    updatedFields: Partial<GroupedComment>,
  ) => void;
  setReplies: (commentId: string, replies: GroupedComment[]) => void;
  addNewReply: (commentId: string, reply: GroupedComment) => void;
  addOldReplies: (commentId: string, oldReplies: GroupedComment[]) => void;
  deleteReply: (commentId: string, replyId: string) => void;
  updateReply: (
    commentId: string,
    replyId: string,
    updatedFields: Partial<GroupedComment>,
  ) => void;
}

export const useCommentStore = create<CommentStore>((set) => ({
  commentsByPostId: {},
  repliesByCommentId: {},
  setComments: (postId, comments) =>
    set((state) => ({
      commentsByPostId: {
        ...state.commentsByPostId,
        [postId]: comments,
      },
    })),
  addNewComments: (postId, comment) =>
    set((state) => ({
      commentsByPostId: {
        ...state.commentsByPostId,
        [postId]: [comment, ...(state.commentsByPostId[postId] || [])],
      },
    })),
  addOldComments: (postId, oldComments) =>
    set((state) => ({
      commentsByPostId: {
        ...state.commentsByPostId,
        [postId]: [...(state.commentsByPostId[postId] || []), ...oldComments],
      },
    })),
  deleteComment: (postId, commentId) =>
    set((state) => ({
      commentsByPostId: {
        ...state.commentsByPostId,
        [postId]: (state.commentsByPostId[postId] || []).filter(
          (c) => c.id !== commentId,
        ),
      },
    })),
  updateComment: (postId, commentId, updatedFields) =>
    set((state) => {
      const comments = state.commentsByPostId[postId] || [];

      const updatedComments = comments.map((comment) =>
        comment.id === commentId ? { ...comment, ...updatedFields } : comment,
      );

      return {
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: updatedComments,
        },
      };
    }),
  setReplies: (commentId, replies) =>
    set((state) => ({
      repliesByCommentId: {
        ...state.repliesByCommentId,
        [commentId]: replies,
      },
    })),
  addNewReply: (commentId: string, reply: GroupedComment) =>
    set((state) => {
      const updatedReplies = {
        ...state.repliesByCommentId,
        [commentId]: [reply, ...(state.repliesByCommentId[commentId] || [])],
      };

      return {
        repliesByCommentId: updatedReplies,
      };
    }),
  addOldReplies: (commentId, oldReplies) =>
    set((state) => ({
      repliesByCommentId: {
        ...state.repliesByCommentId,
        [commentId]: [
          ...(state.repliesByCommentId[commentId] || []),
          ...oldReplies,
        ],
      },
    })),
  deleteReply: (parentId, replyId) =>
    set((state) => ({
      repliesByCommentId: {
        ...state.repliesByCommentId,
        [parentId]: (state.repliesByCommentId[parentId] || []).filter(
          (r) => r.id !== replyId,
        ),
      },
    })),
  updateReply: (commentId, replyId, updatedFields) =>
    set((state) => {
      const replies = state.repliesByCommentId[commentId] || [];

      const updatedReplies = replies.map((reply) =>
        reply.id === replyId ? { ...reply, ...updatedFields } : reply,
      );

      return {
        repliesByCommentId: {
          ...state.repliesByCommentId,
          [commentId]: updatedReplies,
        },
      };
    }),
}));
