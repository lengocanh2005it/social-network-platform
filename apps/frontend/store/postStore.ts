import { Post, TaggedUserType, TopLikedUserType } from "@/utils";
import { create } from "zustand";

export interface PostDetails extends Post {
  likedByCurrentUser: boolean;
  topLikedUsers: TopLikedUserType[];
  parent_post_id?: string;
  parent_post?: PostDetails;
  total_tagged_users: number;
  tagged_users: {
    data: TaggedUserType[];
    nextCursor?: string;
  };
  markedByCurrentUser: boolean;
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
  appendOldHomePosts: (posts: PostDetails[]) => void;
  hideHomePosts: (postId: string) => void;
  restoreHomePostAtIndex: (post: PostDetails, index: number) => void;
  getPostById: (postId: string) => PostDetails | undefined;
  updateHomePost: (postId: string, update: Partial<PostDetails>) => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
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
  updateHomePost: (postId, update) =>
    set((state) => ({
      homePosts: state.homePosts.map((post) =>
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
  appendOldHomePosts: (oldPosts) =>
    set((state) => ({
      homePosts: [...state.homePosts, ...oldPosts],
    })),
  getPostById: (postId) => {
    const state = get();
    return state.posts.find((post) => post.id === postId);
  },
}));
