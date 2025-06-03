"use client";
import ChatBoxContent from "@/components/chatbox/ChatBoxContent";
import ChatBoxHeader from "@/components/chatbox/ChatBoxHeader";
import ChatBoxInput from "@/components/chatbox/ChatBoxInput";
import { useFriendStore } from "@/store";
import React from "react";

const ChatBox: React.FC = () => {
  const { openChats } = useFriendStore();

  return (
    <div className="fixed bottom-0 right-[27%] flex gap-2">
      {openChats.map((friend) => (
        <div
          key={friend.user_id}
          className="w-80 h-100 bg-white border border-black/20 rounded-t-lg flex flex-col"
        >
          <ChatBoxHeader friend={friend} />

          <ChatBoxContent friend={friend} />

          <ChatBoxInput />
        </div>
      ))}
    </div>
  );
};

export default ChatBox;
