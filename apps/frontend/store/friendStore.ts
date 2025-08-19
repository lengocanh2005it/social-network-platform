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
  updateOnlineStatus: (onlineIds: string[]) => void;
  addFriends: (newFriends: Friend[]) => void;
  removeFriend: (friendId: string) => void;
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
          const movedToHidden = openChats[0];
          const remainingChats = openChats.slice(1);
          set({
            openChats: [...remainingChats, friend],
            hiddenChats: [...hiddenChats, movedToHidden],
          });
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

      updateOnlineStatus: (onlineIds) => {
        const { friends } = get();
        const updatedFriends = friends.map((f) => ({
          ...f,
          is_online: onlineIds.includes(f.user_id),
        }));
        set({ friends: updatedFriends });
      },

      addFriends: (newFriends) =>
        set((state) => ({
          friends: [...state.friends, ...newFriends],
        })),

      removeFriend: (friendId: string) =>
        set((state) => ({
          friends: state.friends.filter(
            (friend) => friend.user_id !== friendId
          ),
        })),
    }),
    {
      name: "friend-storage",
      partialize: (state) => ({
        friends: state.friends,
        openChats: state.openChats,
        hiddenChats: state.hiddenChats,
        totalFriends: state.totalFriends,
      }),
    }
  )
);
