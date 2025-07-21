"use client";
import StoryModal from "@/components/modal/StoryModal";
import { useViewNotification } from "@/hooks";
import { getStory } from "@/lib/api/stories";
import { useUserStore } from "@/store";
import { handleAxiosError, Notification, Story } from "@/utils";
import { Avatar, Checkbox } from "@heroui/react";
import { NotificationTypeEnum } from "@repo/db";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isSelected,
  onSelect,
}) => {
  const { sender, content, created_at, is_read, id } = notification;
  const { user } = useUserStore();
  const { mutate: mutateViewNotification } = useViewNotification();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);

  const handleGetStory = async (storyId: string) => {
    try {
      const res = await getStory(storyId);

      if (res) setStory(res);
    } catch (err) {
      handleAxiosError(err);
    }
  };

  const handleClickNotification = () => {
    if (!user || !user.profile || !notification.metadata) return;

    mutateViewNotification(notification.id, {
      onSuccess: async (data: Notification) => {
        if (data) {
          if (notification.type === NotificationTypeEnum.post_liked) {
            router.push(
              `/${user.profile.username}/posts/${notification?.metadata?.post_id ?? ""}`,
            );
          } else if (notification.type === NotificationTypeEnum.post_shared) {
            router.push(
              `/${notification?.metadata?.post_username}/posts/${notification?.metadata?.post_id}`,
            );
          } else if (
            notification.type === NotificationTypeEnum.post_commented
          ) {
            router.push(
              `/${user.profile.username}/posts/${notification?.metadata?.post_id ?? ""}/?commentId=${notification?.metadata?.comment_id}`,
            );
          } else if (
            notification.type === NotificationTypeEnum.comment_liked ||
            notification.type === NotificationTypeEnum.comment_replied
          ) {
            router.push(
              `/${notification?.metadata?.post_username}/posts/${notification?.metadata?.post_id ?? ""}/?commentId=${notification?.metadata?.comment_id}`,
            );
          } else if (
            notification.type === NotificationTypeEnum.story_added_by_friend
          ) {
            await handleGetStory(notification.metadata?.story_id ?? "");
          } else if (
            notification.type == NotificationTypeEnum.friend_request_accepted ||
            notification.type === NotificationTypeEnum.friend_request_rejected
          ) {
            router.push(`/profile/${notification.metadata?.target.username}`);
          } else if (
            notification.type === NotificationTypeEnum.friend_request
          ) {
            router.push(
              `/profile/${notification.metadata?.initiator?.username}`,
            );
          }
        }
      },
    });
  };

  return (
    <>
      <div
        className={`group flex relative gap-1 p-3 cursor-pointer rounded-md items-center select-none
         hover:bg-gray-100 transition ${!is_read ? "bg-blue-50 dark:bg-white/40" : "hover:bg-white/20"}`}
        onClick={handleClickNotification}
      >
        <div className={`${isSelected ? "block" : "hidden"} group-hover:block`}>
          <Checkbox
            isSelected={isSelected}
            onValueChange={(checked: boolean) => onSelect(id, checked)}
          />
        </div>

        <div className="flex md:gap-3 justify-between w-full">
          <div className="flex md:gap-3">
            {sender && (
              <Avatar
                src={sender.avatar_url}
                alt={sender.full_name}
                className="cursor-pointer select-none w-10 h-10 flex-shrink-0 rounded-full"
              />
            )}
            <div className="flex-1 text-sm">
              <p className="text-gray-800 dark:text-white/80 font-xs">
                {sender?.full_name}
              </p>
              <p className="text-gray-600 dark:text-white">{content}</p>
              <p className="text-xs text-gray-400 dark:text-white/60">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {!is_read && (
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
          )}
        </div>
      </div>

      {story && <StoryModal story={story} onClose={() => setStory(null)} />}
    </>
  );
};

export default NotificationItem;
