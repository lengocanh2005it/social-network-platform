import { Friend } from "@/utils";
import React from "react";

interface ChatBoxContentProps {
  friend: Friend;
}

const ChatBoxContent: React.FC<ChatBoxContentProps> = ({ friend }) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 text-sm">
      <p>Chat content with {friend.full_name}...</p>
    </div>
  );
};

export default ChatBoxContent;
