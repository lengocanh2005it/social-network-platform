"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useFriendStore, useUserStore } from "@/store";
import { ConversationDropdownType, formatDateTimeFacebookStyle } from "@/utils";
import { Avatar } from "@heroui/react";
import React from "react";

interface ConversationsListProps {
  conversations: ConversationDropdownType[];
  ref: (node: HTMLDivElement | null) => void;
  hasMore: boolean;
  setShowDropdown: (showDropdown: boolean) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  ref,
  hasMore,
  setShowDropdown,
}) => {
  const { user } = useUserStore();
  const { openChat } = useFriendStore();

  return (
    <div className="relative flex flex-col gap-1 px-2">
      {conversations.map((conversation, index) => (
        <div
          key={conversation.id}
          className={`flex items-center justify-between flex-1 w-full p-2 rounded-lg
    cursor-pointer select-none md:gap-3 gap-2
    ${
      !conversation.last_message.is_read_by_receiver &&
      conversation.last_message.user.id !== user?.id
        ? "bg-blue-50 hover:bg-blue-100 dark:bg-white/40 dark:hover:bg-white/50"
        : "hover:bg-gray-100 dark:hover:bg-white/20"
    }
  `}
          ref={index === conversations.length - 1 ? ref : null}
          onClick={() => {
            openChat(conversation.target_user);
            setShowDropdown(false);
          }}
        >
          <div className="flex items-center justify-center md:gap-2 gap-1">
            <Avatar
              src={conversation.target_user.avatar_url}
              alt={conversation.target_user.full_name}
            />

            <div className="flex flex-col relative">
              <h1
                className={`${
                  !conversation.last_message.is_read_by_receiver &&
                  conversation.last_message.user.id !== user?.id
                    ? "font-semibold dark:text-white"
                    : "font-normal dark:text-white"
                }`}
              >
                {conversation.target_user.full_name}
              </h1>

              <div className="flex items-center gap-1">
                <p className="text-gray-600 dark:text-white/60 text-xs italic">
                  {conversation.last_message?.user?.id === user?.id
                    ? "You"
                    : conversation.last_message?.user?.full_name}
                  :
                </p>

                <div className="flex items-center text-xs text-gray-600 dark:text-white/60 gap-x-1">
                  <p
                    className={`truncate max-w-[150px] ${
                      !conversation.last_message.is_read_by_receiver &&
                      conversation.last_message.user.id !== user?.id
                        ? "font-medium text-black dark:text-white"
                        : "text-gray-600 dark:text-white/80"
                    }`}
                  >
                    {conversation.last_message.content}
                  </p>
                  <span className="mx-1">·</span>
                  <p className="text-nowrap text-xs">
                    {formatDateTimeFacebookStyle(conversation.last_message_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!conversation.last_message.is_read_by_receiver &&
            conversation.last_message.user.id !== user?.id && (
              <span className="w-2 h-2 bg-blue-500 rounded-full ml-1 animate-pulse" />
            )}
        </div>
      ))}

      {hasMore && <PrimaryLoading />}
    </div>
  );
};

export default ConversationsList;
