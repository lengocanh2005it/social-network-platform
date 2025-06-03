import { useUserStore } from "@/store";
import { Avatar, Input } from "@heroui/react";
import { SendHorizonalIcon } from "lucide-react";
import React, { useState } from "react";

const ChatBoxInput: React.FC = () => {
  const { user } = useUserStore();
  const [message, setMessage] = useState<string>("");

  return (
    <>
      {user && (
        <div
          className="w-full p-2 border-t border-t-black/10
         flex items-center justify-between md:gap-2 gap-1"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center 
          cursor-pointer select-none"
          >
            <Avatar
              src={user.profile.avatar_url}
              alt={user.profile.first_name + " " + user.profile.last_name}
            />
          </div>

          <Input
            placeholder="Enter a message..."
            size="md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            endContent={message?.trim() !== "" ? <SendHorizonalIcon /> : null}
          />
        </div>
      )}
    </>
  );
};

export default ChatBoxInput;
