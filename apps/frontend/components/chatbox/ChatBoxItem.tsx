"use client";
import ChatBoxContent from "@/components/chatbox/ChatBoxContent";
import ChatBoxHeader from "@/components/chatbox/ChatBoxHeader";
import ChatBoxInput from "@/components/chatbox/ChatBoxInput";
import { useGetConversationWithTargetUser } from "@/hooks";
import { useConversationStore, useUserStore } from "@/store";
import { Friend, Message } from "@/utils";
import { Spinner } from "@heroui/react";
import React, { useEffect, useState } from "react";

interface ChatBoxItemProps {
  friend: Friend;
}

const ChatBoxItem: React.FC<ChatBoxItemProps> = ({ friend }) => {
  const { user } = useUserStore();
  const { setConversation } = useConversationStore();
  const { data, isLoading } = useGetConversationWithTargetUser(
    user?.id ?? "",
    friend.user_id,
  );
  useEffect(() => {
    if (data) {
      setConversation(friend.user_id, data);
    }
  }, [data, setConversation, friend]);
  const [parentMessage, setParentMessage] = useState<Message | null>(null);

  return (
    <div className="w-85 h-100 bg-white border border-black/20 rounded-t-lg flex flex-col relative">
      <ChatBoxHeader friend={friend} />

      {isLoading ? (
        <div
          className="w-full flex-1 md:mt-8 mt-4 flex md:gap-3 gap-2 
        flex-col items-center justify-center text-center"
        >
          <Spinner />

          <p>Loading...</p>
        </div>
      ) : (
        <ChatBoxContent friend={friend} setParentMessage={setParentMessage} />
      )}

      {parentMessage && (
        <div
          className="absolute bottom-15 left-0 right-0
        p-3 bg-gray-500 rounded-t-lg border border-black/10 text-white
        flex items-start justify-between text-sm z-10"
        >
          <div className="flex flex-col">
            <span className="text-xs text-white/80">
              Replying to {parentMessage.user.full_name}:
            </span>
            <span className="text-sm text-white truncate">
              {parentMessage.content}
            </span>
          </div>
          <button
            className="ml-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
            onClick={() => setParentMessage(null)}
          >
            x
          </button>
        </div>
      )}

      <ChatBoxInput
        friend={friend}
        parentMessage={parentMessage}
        setParentMessage={setParentMessage}
      />
    </div>
  );
};

export default ChatBoxItem;
