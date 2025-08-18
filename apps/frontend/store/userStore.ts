import { getMe } from "@/lib/api/users";
import { Friend, handleAxiosError, RelationshipType } from "@/utils";
import {
  UserEducationsType,
  UserProfilesType,
  UserSocialsType,
  UsersType,
  UserWorkPlacesType,
} from "@repo/db";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FullUserType = Omit<UsersType, "password"> & {
  profile: UserProfilesType;
  educations: UserEducationsType[];
  socials: UserSocialsType[];
  work_places: UserWorkPlacesType[];
} & {
  total_friends: number;
  is_online: boolean;
  last_seen_at: string | null;
};

interface UserState {
  user: FullUserType | null;
  relationship: RelationshipType | null;
  friends: Friend[];
  setRelationship: (relationship: RelationshipType | null) => void;
  viewedUser: FullUserType | null;
  educationsHistory: UserEducationsType[][];
  workPlacesHistory: UserWorkPlacesType[][];
  selectedTaggedUsers: Friend[];
  originalTaggedUsers: Friend[];
  tempSelectedTaggedUsers: Friend[];
  totalTaggedUsers: number;
  setTotalTaggedUsers: (totalTaggedUsers: number) => void;
  setTempSelectedTaggedUsers: (
    payload: Friend[] | ((prev: Friend[]) => Friend[]),
  ) => void;
  setOriginalTaggedUsers: (
    payload: Friend[] | ((prev: Friend[]) => Friend[]),
  ) => void;
  setSelectedTaggedUsers: (
    payload: Friend[] | ((prev: Friend[]) => Friend[]),
  ) => void;
  clearSelectedTaggedUsers: () => void;
  setUser: (user: FullUserType | null) => void;
  setViewedUser: (user: FullUserType | null) => void;
  resetUser: () => void;
  resetUserEducations: () => void;
  resetUserWorkPlaces: () => void;
  resetUserProfile: () => void;
  backupUserEducations: () => void;
  backupUserWorkPlaces: () => void;
  restoreUserEducations: () => void;
  restoreUserWorkPlaces: () => void;
  removeUserEducation: (id: string) => void;
  removeUserWorkPlace: (id: string) => void;
  updateUserEducation: (id: string, data: Partial<UserEducationsType>) => void;
  updateUserWorkPlace: (id: string, data: Partial<UserWorkPlacesType>) => void;
  clearWorkPlacesHistory: () => void;
  clearEducationsHistory: () => void;
  setFriends: (friends: Friend[]) => void;
  updateFriendById: (userId: string, update: Partial<Friend>) => void;
  removeFriendById: (userId: string) => void;
  addOldFriends: (friends: Friend[]) => void;
}

const initialUserState: Pick<
  UserState,
  | "user"
  | "educationsHistory"
  | "workPlacesHistory"
  | "viewedUser"
  | "relationship"
  | "friends"
  | "selectedTaggedUsers"
  | "originalTaggedUsers"
  | "tempSelectedTaggedUsers"
  | "totalTaggedUsers"
> = {
  user: null,
  viewedUser: null,
  relationship: null,
  educationsHistory: [],
  workPlacesHistory: [],
  friends: [],
  selectedTaggedUsers: [],
  originalTaggedUsers: [],
  tempSelectedTaggedUsers: [],
  totalTaggedUsers: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialUserState,
      setTotalTaggedUsers: (totalTaggedUsers) => set({ totalTaggedUsers }),
      setTempSelectedTaggedUsers: (payload) =>
        set((state) => ({
          tempSelectedTaggedUsers:
            typeof payload === "function"
              ? payload(state.tempSelectedTaggedUsers)
              : payload,
        })),
      setOriginalTaggedUsers: (payload) =>
        set((state) => ({
          originalTaggedUsers:
            typeof payload === "function"
              ? payload(state.originalTaggedUsers)
              : payload,
        })),
      setSelectedTaggedUsers: (payload) =>
        set((state) => ({
          selectedTaggedUsers:
            typeof payload === "function"
              ? payload(state.selectedTaggedUsers)
              : payload,
        })),
      clearSelectedTaggedUsers: () => set({ selectedTaggedUsers: [] }),
      setFriends: (friends) => set({ friends }),
      setRelationship: (relationship) => set({ relationship }),
      setViewedUser: (user) => set({ viewedUser: user }),
      setUser: (user) => set({ user }),
      resetUser: () => set({ ...initialUserState }),
      resetUserEducations: () => {
        const currentUser = get().user;

        if (!currentUser) return;

        const filteredEducations = currentUser.educations.filter(
          (edu) => !edu.id.startsWith("temp-"),
        );

        set({
          user: {
            ...currentUser,
            educations: filteredEducations,
          },
        });
      },
      resetUserWorkPlaces: () => {
        const currentUser = get().user;

        if (!currentUser) return;

        const filteredWorkPlaces = currentUser.work_places.filter(
          (work) => !work.id.startsWith("temp-"),
        );

        set({
          user: {
            ...currentUser,
            work_places: filteredWorkPlaces,
          },
        });
      },
      resetUserProfile: async () => {
        const currentUser = get().user;

        if (!currentUser || !currentUser.profile) return;

        try {
          const response = await getMe({
            includeProfile: true,
            username: currentUser.profile.username,
          });

          if (!response?.profile)
            throw new Error("Error occured when fetching profile of user.");

          set({
            user: {
              ...currentUser,
              profile: response.profile,
            },
          });
        } catch (error: any) {
          handleAxiosError(error);
        }
      },
      removeUserEducation: (id: string) => {
        const currentUser = get().user;

        if (!currentUser) return;

        get().backupUserEducations();

        const updatedEducations = currentUser.educations.filter(
          (edu) => edu.id !== id,
        );

        set({
          user: {
            ...currentUser,
            educations: updatedEducations,
          },
        });

        toast.success("Your education removed successfully!");
      },
      removeUserWorkPlace: (id: string) => {
        const currentUser = get().user;

        if (!currentUser) return;

        get().backupUserWorkPlaces();

        const updatedWorkPlaces = currentUser.work_places.filter(
          (work) => work.id !== id,
        );

        set({
          user: {
            ...currentUser,
            work_places: updatedWorkPlaces,
          },
        });

        toast.success("Your work place removed successfully!");
      },
      updateUserEducation: (id, data) => {
        const currentUser = get().user;

        if (!currentUser) return;

        const updatedEducations = currentUser.educations.map((edu) =>
          edu.id === id ? { ...edu, ...data, updated_at: new Date() } : edu,
        );

        set({
          user: {
            ...currentUser,
            educations: updatedEducations,
          },
        });

        toast.success("Your education updated successfully!");
      },
      updateUserWorkPlace: (id, data) => {
        const currentUser = get().user;

        if (!currentUser) return;

        const updatedWorkPlaces = currentUser.work_places.map((work) =>
          work.id === id ? { ...work, ...data, updated_at: new Date() } : work,
        );

        set({
          user: {
            ...currentUser,
            work_places: updatedWorkPlaces,
          },
        });

        toast.success("Your work place updated successfully!");
      },
      backupUserEducations: () => {
        const currentUser = get().user;

        if (!currentUser) return;

        set({
          educationsHistory: [
            ...get().educationsHistory,
            currentUser.educations,
          ],
        });
      },
      backupUserWorkPlaces: () => {
        const currentUser = get().user;

        if (!currentUser) return;

        set({
          workPlacesHistory: [
            ...get().workPlacesHistory,
            currentUser.work_places,
          ],
        });
      },
      restoreUserEducations: () => {
        const currentUser = get().user;
        const history = get().educationsHistory;

        if (!currentUser || history.length === 0) return;

        const lastHistory = history[history.length - 1];

        set({
          user: {
            ...currentUser,
            educations: JSON.parse(JSON.stringify(lastHistory)),
          },
          educationsHistory: history.slice(0, -1),
        });

        toast.success("Your education restored successfully!");
      },
      restoreUserWorkPlaces: () => {
        const currentUser = get().user;
        const history = get().workPlacesHistory;

        if (!currentUser || history.length === 0) return;

        const lastHistory = history[history.length - 1];

        set({
          user: {
            ...currentUser,
            work_places: JSON.parse(JSON.stringify(lastHistory)),
          },
          workPlacesHistory: history.slice(0, -1),
        });

        toast.success("Your work place restored successfully!");
      },
      clearWorkPlacesHistory: () => {
        set({ workPlacesHistory: [] });
      },
      clearEducationsHistory: () => {
        set({ educationsHistory: [] });
      },
      updateFriendById: (userId, update) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.user_id === userId ? { ...f, ...update } : f,
          ),
        })),
      removeFriendById: (userId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.user_id !== userId),
        })),
      addOldFriends: (newFriends) =>
        set((state) => ({
          friends: [...state.friends, ...newFriends],
        })),
    }),
    {
      name: "user-storage",
    },
  ),
);
