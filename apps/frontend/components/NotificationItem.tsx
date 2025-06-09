"use client";
import { Notification } from "@/utils";
import { Avatar, Checkbox } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import React from "react";

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

  return (
    <div
      className={`group flex relative gap-1 p-3 cursor-pointer rounded-md items-center select-none
         hover:bg-gray-100 transition ${!is_read ? "bg-blue-50" : ""}`}
    >
      <div className={`${isSelected ? "block" : "hidden"} group-hover:block`}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={(checked: boolean) => onSelect(id, checked)}
        />
      </div>

      <div className="flex md:gap-3">
        {sender && (
          <Avatar
            src={sender.avatar_url}
            alt={sender.full_name}
            className="cursor-pointer select-none w-10 h-10 flex-shrink-0 rounded-full"
          />
        )}
        <div className="flex-1 text-sm">
          <p className="text-gray-800 font-xs">{sender?.full_name}</p>
          <p className="text-gray-600">{content}</p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </p>
        </div>

        {!is_read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
      </div>
    </div>
  );
};

export default NotificationItem;
