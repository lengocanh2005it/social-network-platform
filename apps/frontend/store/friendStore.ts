import { Friend, MAX_VISIBLE_CHATBOX } from "@/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FriendState {
  friends: Friend[];
  openChats: Friend[];
  hiddenChats: Friend[];
  totalFriends: number;
  setFriends: (friends: Friend[]) => void;
  setTotalFriends: (totalFriends: number) => void;
  openChat: (friend: Friend) => void;
  closeChat: (friendId: string) => void;
  clearOpenChats: () => void;
}

export const useFriendStore = create<FriendState>()(
  persist(
    (set, get) => ({
      friends: [],
      openChats: [],
      hiddenChats: [],
      totalFriends: 0,

      setFriends: (friends) => set({ friends }),
      setTotalFriends: (totalFriends) => set({ totalFriends }),

      openChat: (friend) => {
        const { openChats, hiddenChats } = get();
        const isAlreadyOpen =
          openChats.some((c) => c.user_id === friend.user_id) ||
          hiddenChats.some((c) => c.user_id === friend.user_id);

        if (isAlreadyOpen) return;

        if (openChats.length < MAX_VISIBLE_CHATBOX) {
          set({ openChats: [...openChats, friend] });
        } else {
          set({ hiddenChats: [...hiddenChats, friend] });
        }
      },

      closeChat: (friendId) => {
        const { openChats, hiddenChats } = get();
        const newOpenChats = openChats.filter((c) => c.user_id !== friendId);

        if (hiddenChats.length > 0) {
          const [firstHidden, ...restHidden] = hiddenChats;
          set({
            openChats: [...newOpenChats, firstHidden],
            hiddenChats: restHidden,
          });
        } else {
          set({ openChats: newOpenChats });
        }
      },

      clearOpenChats: () => set({ openChats: [], hiddenChats: [] }),
    }),
    {
      name: "friend-storage",
      partialize: (state) => ({
        friends: state.friends,
        openChats: state.openChats,
        hiddenChats: state.hiddenChats,
        totalFriends: state.totalFriends,
      }),
    },
  ),
);
