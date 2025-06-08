"use client";
import { useFriendStore } from "@/store";
import { Friend } from "@/utils";
import { Avatar, Tooltip } from "@heroui/react";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ChatBoxHeaderProps {
  friend: Friend;
}

const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({ friend }) => {
  const { closeChat } = useFriendStore();
  const router = useRouter();

  const handleViewProfile = () => {
    router.push(`/profile/${friend.username}`);
  };

  return (
    <div className="flex bg-gray-200 rounded-t-lg items-center justify-between border-b p-3">
      <div className="flex items-center md:gap-2 gap-1">
        <div className="relative">
          <Avatar
            src={friend.avatar_url}
            alt={friend.full_name}
            className="select-none cursor-pointer object-cover"
            onClick={handleViewProfile}
          />

          {friend.is_online && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
            border-2 border-white"
            />
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium">{friend.full_name}</span>
          <span className="text-xs text-gray-500">@{friend.username}</span>
        </div>
      </div>

      <Tooltip content="Close" color="primary">
        <XIcon
          size={20}
          className="cursor-pointer opacity-60 hover:opacity-100 ease-in-out transition-all
      duration-250 focus:outline-none"
          onClick={() => closeChat(friend.user_id)}
        />
      </Tooltip>
    </div>
  );
};

export default ChatBoxHeader;
