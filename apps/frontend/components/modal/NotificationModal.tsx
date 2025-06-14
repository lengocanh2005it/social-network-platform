"use client";
import { useViewNotification } from "@/hooks";
import { useUserStore } from "@/store";
import { formatDateTime, Notification } from "@/utils";
import { NotificationTypeEnum } from "@repo/db";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface NotificationModalProps {
  notification: Notification;
  onClose?: () => void;
  show: boolean;
  setShow: (show: boolean) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  show,
  setShow,
}) => {
  const { user } = useUserStore();
  const { mutate: mutateViewNotification } = useViewNotification();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose, setShow]);

  const handleClickNotification = () => {
    if (!user || !user.profile || !notification.metadata) return;

    mutateViewNotification(notification.id, {
      onSuccess: (data: Notification) => {
        if (data) {
          if (notification.type === NotificationTypeEnum.post_liked) {
            router.push(
              `/${user.profile.username}/posts/${notification?.metadata?.post_id ?? ""}`,
            );
          } else if (
            notification.type === NotificationTypeEnum.post_commented
          ) {
            router.push(
              `/${user.profile.username}/posts/${notification?.metadata?.post_id ?? ""}/?commentId=${notification?.metadata?.comment_id}`,
            );
          }

          if (onClose) onClose();
        }
      },
    });
  };

  return (
    <>
      {notification && (
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
              className="relative w-full bg-white shadow-md rounded-xl border 
              border-gray-200 p-4 pr-6 
              flex gap-3 items-start cursor-pointer hover:bg-gray-100"
              onClick={handleClickNotification}
            >
              <button
                onClick={(e) => {
                  setShow(false);
                  e.stopPropagation();
                }}
                className="absolute cursor-pointer top-2 right-2 
                text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>

              {notification.sender?.avatar_url && (
                <Image
                  src={notification.sender.avatar_url}
                  alt={notification.sender.full_name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              )}

              <div className="text-sm text-gray-800">
                <p className="font-medium">{notification.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTime(notification.created_at)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default NotificationModal;
