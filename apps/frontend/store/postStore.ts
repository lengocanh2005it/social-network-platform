import { Post, TopLikedUserType } from "@/utils";
import { create } from "zustand";

export interface PostDetails extends Post {
  likedByCurrentUser: boolean;
  topLikedUsers: TopLikedUserType[];
  parent_post_id?: string;
  parent_post?: PostDetails;
}

interface PostStore {
  posts: PostDetails[];
  nextCursor: string | null;
  setPosts: (posts: PostDetails[], nextCursor: string | null) => void;
  addNewPost: (post: PostDetails) => void;
  appendOldPosts: (posts: PostDetails[], nextCursor: string | null) => void;
  hidePost: (postId: string) => void;
  updatePost: (postId: string, update: Partial<PostDetails>) => void;
  restorePostAtIndex: (post: PostDetails, index: number) => void;
  clearPosts: () => void;
  homePosts: PostDetails[];
  nextHomeCursor: string | null;
  setHomePosts: (posts: PostDetails[], nextHomeCursor: string | null) => void;
  hideHomePosts: (postId: string) => void;
  restoreHomePostAtIndex: (post: PostDetails, index: number) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  nextCursor: null,
  homePosts: [],
  nextHomeCursor: null,
  setHomePosts: (posts, nextHomeCursor) => {
    set({
      homePosts: posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      nextHomeCursor,
    });
  },
  setPosts: (posts, nextCursor) =>
    set({
      posts: posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      nextCursor,
    }),
  addNewPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),
  appendOldPosts: (newPosts, nextCursor) =>
    set((state) => ({
      posts: [...state.posts, ...newPosts],
      nextCursor,
    })),
  updatePost: (postId, update) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...update } : post,
      ),
    })),
  clearPosts: () => set({ posts: [], nextCursor: null }),
  hidePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),
  restorePostAtIndex: (post, index) =>
    set((state) => {
      const newPosts = [...state.posts];
      newPosts.splice(index, 0, post);
      return { posts: newPosts };
    }),
  restoreHomePostAtIndex: (post, index) =>
    set((state) => {
      const newPosts = [...state.homePosts];
      newPosts.splice(index, 0, post);
      return { homePosts: newPosts };
    }),
  hideHomePosts: (postId) =>
    set((state) => ({
      homePosts: state.homePosts.filter((post) => post.id !== postId),
    })),
}));
