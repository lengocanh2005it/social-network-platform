"use client";

import { Avatar } from "@heroui/react";
import { cn } from "@/lib/utils"; // Giả sử bạn có utility cn để merge classNames

type Props = {
  avatar?: string;
  name: string;
  username: string;
  isOnline?: boolean;
  className?: string;
};

const ChatHeader = ({
  avatar,
  name,
  username,
  isOnline = false,
  className,
}: Props) => (
  <header
    className={cn(
      "sticky top-0 z-10 w-full",
      "px-4 py-3 md:px-6 md:py-4",
      "border-b border-gray-200 dark:border-white/10",
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
      "shadow-sm",
      className,
    )}
  >
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar
          src={avatar}
          alt={name}
          size="md"
          className="ring-2 ring-white dark:ring-gray-800 flex-shrink-0 object-cover"
        />
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 
            border-white dark:border-gray-800"
            aria-label="Online status"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {name}
          </h2>
          {isOnline && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Online
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          @{username}
        </p>
      </div>
    </div>
  </header>
);

export default ChatHeader;
