"use client";

import { Textarea } from "@heroui/react";
import { FiImage, FiSend, FiSmile } from "react-icons/fi";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  theme?: string;
  isPending: boolean;
};

const MessageInput = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  theme,
  isPending,
}: Props) => {
  const isDark = theme === "system" || "dark";

  return (
    <footer
      className="sticky bottom-0 z-10 border-t bg-white dark:bg-gray-900
     dark:border-white/10 py-2"
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 border transition-all duration-150 ${
          isDark ? "bg-gray-900 border-none" : "bg-gray-50 border-gray-200"
        }`}
      >
        <button
          aria-label="Attach file"
          className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 
          dark:hover:bg-gray-700"
        >
          <FiImage size={18} />
        </button>

        <button
          aria-label="Add emoji"
          className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiSmile size={18} />
        </button>

        <div className="flex-1">
          <Textarea
            value={value}
            onChange={onChange}
            onKeyDown={onKeyPress}
            placeholder="Type your message..."
            minRows={1}
            maxRows={4}
            className="w-full bg-transparent resize-none focus:outline-none focus:ring-0 text-sm 
            text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <button
          onClick={onSend}
          disabled={!value.trim() || isPending}
          aria-label="Send message"
          className={`p-2 rounded-md transition-all flex items-center justify-center ${
            value.trim()
              ? "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiSend size={18} />
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;
