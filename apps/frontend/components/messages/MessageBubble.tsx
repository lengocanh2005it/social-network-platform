"use client";
import { format } from "date-fns";
import { IoCheckmarkDone, IoEye } from "react-icons/io5";
import { Message } from "@/utils";
import { FullUserType } from "@/store";

type Props = {
  message: Message;
  isSelf: boolean;
  user?: FullUserType;
};

const MessageBubble = ({ message, isSelf, user }: Props) => (
  <div
    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
      isSelf
        ? "bg-blue-500 text-white rounded-tr-none"
        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
    }`}
  >
    {message.reply_to_message_id && message.parent_message && (
      <div
        className={`text-xs p-2 mb-2 rounded ${
          isSelf ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <p className="font-medium">
          {message.parent_message.user.id === user?.id
            ? "You"
            : message.parent_message.user.full_name}
        </p>
        <p className="truncate">
          {message.parent_message.content.length > 30
            ? `${message.parent_message.content.substring(0, 30)}...`
            : message.parent_message.content}
        </p>
      </div>
    )}
    <p className="whitespace-pre-wrap">{message.content}</p>
    <div className="flex items-center justify-end mt-1 space-x-1">
      <span className="text-xs opacity-70">
        {format(new Date(message.created_at), "h:mm a")}
      </span>
      {isSelf &&
        (message.is_read_by_receiver ? (
          <IoEye className="text-xs text-blue-200" />
        ) : (
          <IoCheckmarkDone className="text-xs text-black/80 dark:text-white/80" />
        ))}
    </div>
  </div>
);

export default MessageBubble;
