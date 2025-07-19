import { BookMark } from "@/utils";
import { create } from "zustand";

interface BookMarkState {
  bookmarks: BookMark[];
  addBookmark: (bookMark: BookMark) => void;
  deleteBookmark: (bookMarkId: string) => void;
}

export const useBookMarkStore = create<BookMarkState>()((set) => ({
  bookmarks: [],
  addBookmark: (bookMark) =>
    set((state) => ({
      bookmarks: [bookMark, ...state.bookmarks],
    })),
  deleteBookmark: (bookMarkId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== bookMarkId),
    })),
}));
