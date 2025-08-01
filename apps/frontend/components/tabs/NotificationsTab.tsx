"use client";
import EmptyNotifications from "@/components/EmptyNotifications";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import NotificationModal from "@/components/modal/NotificationModal";
import NotificationItem from "@/components/NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDeleteNotification,
  useGetNotifications,
  useInfiniteScroll,
  useSSE,
} from "@/hooks";
import { getNotifications } from "@/lib/api/notifications";
import { useNotificationStore, useUserStore } from "@/store";
import { Notification, NotificationStatus } from "@/utils";
import { Tooltip } from "@heroui/react";
import { BellIcon, TrashIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const NotificationsTab: React.FC = () => {
  const { user } = useUserStore();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NotificationStatus | null>(null);
  const { data, isLoading } = useGetNotifications(
    user?.id ?? "",
    activeTab
      ? {
          is_read: activeTab === "read" ? "true" : "false",
        }
      : undefined,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    setNotifications,
    setNextCursor,
    notifications,
    appendNotifications,
    removeNotifications,
    addNewNotification,
  } = useNotificationStore();
  const iconRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const { mutate: mutateDeleteNotification } = useDeleteNotification();
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>(
    [],
  );
  const [visibleNotifications, setVisibleNotifications] = useState<
    Notification[]
  >([]);
  const handleClose = (id: string) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (
      visibleNotifications.length >= 3 ||
      notificationQueue.length === 0 ||
      !user?.id
    )
      return;

    const nextNotifications = notificationQueue
      .filter((nn) => nn.sender?.id !== user.id)
      .slice(0, 3 - visibleNotifications.length);

    if (nextNotifications.length > 0) {
      setVisibleNotifications((prev) => [...prev, ...nextNotifications]);
      setNotificationQueue((prev) => prev.slice(nextNotifications.length));
    }
  }, [notificationQueue, visibleNotifications.length, user?.id]);

  useSSE({
    userId: user?.id ?? "",
    onMessage: (data) => {
      if (data) {
        setNotificationQueue((prev) => [...prev, data]);
        addNewNotification(NotificationStatus.UNREAD, data);
      }
    },
    onError: (err) => {
      console.error(err);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        iconRef.current &&
        !iconRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (data && data?.data && activeTab) {
      setNotifications(activeTab, data.data);
      setNextCursor(activeTab, data?.nextCursor ? data.nextCursor : undefined);
    }
  }, [data, setNotifications, setNextCursor, activeTab]);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setActiveTab(NotificationStatus.UNREAD);
  };

  const loadMore = async () => {
    const currentTab =
      activeTab === NotificationStatus.READ
        ? NotificationStatus.READ
        : NotificationStatus.UNREAD;

    if (
      !notifications[currentTab].nextCursor ||
      notifications[currentTab].loading ||
      !activeTab
    )
      return;

    setHasMore(true);

    try {
      const res = await getNotifications({
        is_read: activeTab === NotificationStatus.READ ? "true" : "false",
        after: notifications[currentTab].nextCursor,
      });

      if (res?.data) appendNotifications(activeTab, res.data);

      setNextCursor(activeTab, res?.nextCursor ? res.nextCursor : undefined);
    } finally {
      setHasMore(false);
    }
  };

  const lastNotificationRef = useInfiniteScroll(
    loadMore,
    !!activeTab && !!notifications[activeTab].nextCursor,
  );

  const handleSelectNotification = (id: string, checked: boolean) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleConfirmDelete = () => {
    if (!activeTab) return;
    mutateDeleteNotification(
      {
        notificationIds: Array.from(selectedNotifications),
      },
      {
        onSuccess: (data: Record<string, string | boolean>) => {
          if (data && data?.success && typeof data?.message === "string") {
            removeNotifications(activeTab, Array.from(selectedNotifications));
            setSelectedNotifications(new Set());
            toast.success(data?.message, {
              position: "bottom-right",
            });
          }
        },
      },
    );
  };

  return (
    <div className="relative dark:text-white">
      <div ref={iconRef}>
        <BellIcon
          className="cursor-pointer focus:outline-none select-none dark:text-white"
          onClick={handleToggleDropdown}
        />
      </div>

      {showDropdown && (
        <div
          className="fixed z-50 bg-white dark:bg-black dark:text-white rounded-xl w-[450px]
          mt-2 shadow-md flex flex-col gap-1
          border border-black/10 p-4 right-10 dark:border-white/40"
          ref={dropdownRef}
        >
          <h1 className="text-center text-medium text-black/80 dark:text-white/80">
            Notifications
          </h1>

          {selectedNotifications.size > 0 && (
            <div className="flex items-center justify-center">
              <Tooltip
                content={`Delete ${selectedNotifications.size} notification${selectedNotifications.size > 1 ? "s" : ""}`}
              >
                <TrashIcon
                  onClick={handleConfirmDelete}
                  className="focus:outline-none cursor-pointer opacity-70 hover:opacity-100 ease-in-out
                transition-all duration-250"
                />
              </Tooltip>
            </div>
          )}

          <div className="relative w-full">
            <div className="flex border-b gap-1">
              <button
                className={`flex-1 p-2 text-sm font-medium outline-none cursor-pointer ${
                  activeTab === NotificationStatus.UNREAD
                    ? "border-b-2 border-blue-500 text-blue-600 dark:border-white/80 dark:text-white"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab(NotificationStatus.UNREAD)}
              >
                Unread
              </button>
              <button
                className={`flex-1 p-2 text-sm font-medium outline-none cursor-pointer ${
                  activeTab === NotificationStatus.READ
                    ? "border-b-2 border-blue-500 text-blue-600 dark:border-white/80 dark:text-white"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab(NotificationStatus.READ)}
              >
                Read
              </button>
            </div>

            <div className="mt-2 text-sm text-gray-700">
              {activeTab === NotificationStatus.READ && (
                <>
                  {isLoading ? (
                    <PrimaryLoading />
                  ) : (
                    <>
                      {notifications[activeTab]?.data?.length > 0 ? (
                        <>
                          <ScrollArea className="max-h-[450px] overflow-y-auto">
                            <div className="flex flex-col md:gap-3 gap-2 overflow-hidden">
                              {notifications[activeTab]?.data?.map(
                                (notification, index, arr) => {
                                  const isLast = index === arr.length - 1;

                                  return (
                                    <div
                                      key={notification.id}
                                      ref={isLast ? lastNotificationRef : null}
                                    >
                                      <NotificationItem
                                        notification={notification}
                                        isSelected={selectedNotifications.has(
                                          notification.id,
                                        )}
                                        onSelect={handleSelectNotification}
                                      />
                                    </div>
                                  );
                                },
                              )}

                              {hasMore && <PrimaryLoading />}
                            </div>
                          </ScrollArea>
                        </>
                      ) : (
                        <EmptyNotifications />
                      )}
                    </>
                  )}
                </>
              )}
              {activeTab === NotificationStatus.UNREAD && (
                <>
                  {isLoading ? (
                    <PrimaryLoading />
                  ) : (
                    <>
                      {notifications[activeTab]?.data?.length > 0 ? (
                        <>
                          <ScrollArea className="max-h-[450px] overflow-y-auto">
                            <div className="flex flex-col md:gap-2 gap-1">
                              {notifications[activeTab]?.data?.map(
                                (notification, index) => (
                                  <div
                                    key={notification.id}
                                    ref={
                                      index ===
                                      notifications[activeTab].data.length - 1
                                        ? lastNotificationRef
                                        : null
                                    }
                                  >
                                    <NotificationItem
                                      notification={notification}
                                      isSelected={selectedNotifications.has(
                                        notification.id,
                                      )}
                                      onSelect={handleSelectNotification}
                                    />
                                  </div>
                                ),
                              )}

                              {hasMore && <PrimaryLoading />}
                            </div>
                          </ScrollArea>
                        </>
                      ) : (
                        <EmptyNotifications />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
        {visibleNotifications.map((notification) => (
          <NotificationModal
            key={notification.id}
            notification={notification}
            show={true}
            setShow={() => handleClose(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsTab;
