"use client";
import { ConversationDropdownType } from "@/utils";
import { Avatar } from "@heroui/react";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import React from "react";

interface ContactItemProps {
  contact: ConversationDropdownType;
  isSelected: boolean;
  onSelect: () => void;
  isOnlyMessages: boolean;
  userId: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  isSelected,
  onSelect,
  isOnlyMessages,
  userId,
}) => {
  return (
    <div
      key={contact.id}
      onClick={onSelect}
      className={clsx(
        "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-blue-50 dark:bg-gray-800"
          : "hover:bg-gray-100 dark:hover:bg-gray-800",
        isOnlyMessages && "p-5",
      )}
    >
      <div className="relative">
        <Avatar
          src={contact.target_user.avatar_url}
          size="md"
          alt={contact.target_user.full_name}
          className="select-none flex-shrink-0"
        />

        {contact.target_user.is_online && (
          <span
            className={clsx(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 flex-shrink-0",
              "bg-green-500",
            )}
          />
        )}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3
            className={clsx(
              "font-medium text-gray-900 dark:text-gray-100",
              !isOnlyMessages && "truncate text-sm",
            )}
          >
            {contact.target_user.full_name}
          </h3>

          <span
            className={`${!isOnlyMessages ? "text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}
          >
            {formatDistanceToNow(new Date(contact.last_message_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div
          className={`flex ${!isOnlyMessages && "justify-between"} items-center`}
        >
          <p
            className={clsx(
              "text-gray-500 dark:text-gray-400 truncate flex items-center md:gap-1",
              isOnlyMessages ? "max-w-[900px]" : "max-w-[180px]",
            )}
          >
            <span className="text-sm dark:text-gray-500">
              {contact.last_message.user.id !== userId
                ? contact.target_user.full_name
                : "You"}
              :
            </span>{" "}
            {contact.last_message.content}
          </p>

          {!contact.last_message.is_read_by_receiver ? (
            <span
              className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full 
            bg-blue-500 text-xs font-medium text-white"
            >
              1
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ContactItem;
