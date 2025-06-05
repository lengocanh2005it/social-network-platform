"use client";
import ChatBoxItem from "@/components/chatbox/ChatBoxItem";
import { useFriendStore } from "@/store";
import React from "react";

interface ChatBoxProps {
  right: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({ right }) => {
  const { openChats } = useFriendStore();

  return (
    <div
      className={`fixed bottom-0 flex gap-2 z-[200]`}
      style={{ right: `${right}%` }}
    >
      {openChats.map((friend) => (
        <ChatBoxItem friend={friend} key={friend.user_id} />
      ))}
    </div>
  );
};

export default ChatBox;
