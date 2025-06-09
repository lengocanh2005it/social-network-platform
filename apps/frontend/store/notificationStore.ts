import {
  Notification,
  NotificationGroupState,
  NotificationStatus,
} from "@/utils";
import { create } from "zustand";

interface NotificationState {
  notifications: Record<NotificationStatus, NotificationGroupState>;
  setNotifications: (
    status: NotificationStatus,
    notifications: Notification[],
  ) => void;
  setLoading: (status: NotificationStatus, loading: boolean) => void;
  setNextCursor: (
    status: NotificationStatus,
    cursor: string | undefined,
  ) => void;
  addNewNotification: (
    status: NotificationStatus,
    notification: Notification,
  ) => void;
  appendNotifications: (
    status: NotificationStatus,
    notifications: Notification[],
  ) => void;
  removeNotifications: (status: NotificationStatus, ids: string[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: {
    [NotificationStatus.READ]: {
      data: [],
      loading: false,
      error: undefined,
      nextCursor: undefined,
    },
    [NotificationStatus.UNREAD]: {
      data: [],
      loading: false,
      error: undefined,
      nextCursor: undefined,
    },
  },
  setNotifications: (status, notifications) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [status]: {
          ...state.notifications[status],
          data: notifications,
        },
      },
    })),
  setLoading: (status, loading) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [status]: {
          ...state.notifications[status],
          loading,
        },
      },
    })),
  setNextCursor: (status, cursor) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [status]: {
          ...state.notifications[status],
          nextCursor: cursor,
        },
      },
    })),
  addNewNotification: (status, notification) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [status]: {
          ...state.notifications[status],
          data: [notification, ...state.notifications[status].data],
        },
      },
    }));
  },
  appendNotifications: (status, notifications) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [status]: {
          ...state.notifications[status],
          data: [...state.notifications[status].data, ...notifications],
        },
      },
    }));
  },
  removeNotifications: (status, ids) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [status]: {
          ...state.notifications[status],
          data: state.notifications[status].data.filter(
            (notification) => !ids.includes(notification.id),
          ),
        },
      },
    }));
  },
}));
