"use client";
import { useCreateMessage, useFingerprint, useSocket } from "@/hooks";
import { useConversationStore, useUserStore } from "@/store";
import { CreateMessageDto, Friend, Message, SocketNamespace } from "@/utils";
import { Avatar, Input } from "@heroui/react";
import { SendHorizonalIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatBoxInputProps {
  friend: Friend;
  setParentMessage: (parentMessage: Message | null) => void;
  parentMessage: Message | null;
}

const ChatBoxInput: React.FC<ChatBoxInputProps> = ({
  friend,
  setParentMessage,
  parentMessage,
}) => {
  const { user } = useUserStore();
  const [message, setMessage] = useState<string>("");
  const { mutate: mutateCreateMessage } = useCreateMessage();
  const { addMessage, conversations, setHasNewMessage } =
    useConversationStore();
  const finger_print = useFingerprint();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { on, off, emit } = useSocket(
    SocketNamespace.CONVERSATIONS,
    finger_print ?? ""
  );

  useEffect(() => {
    if (parentMessage) {
      inputRef.current?.focus();
    }
  }, [parentMessage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        inputRef.current.blur();
        setParentMessage(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setParentMessage]);

  useEffect(() => {
    const messageHandler = (data: Message) =>
      addMessage(conversations[friend.user_id]?.id, data);

    on("newMessage", messageHandler);

    return () => off("newMessage", messageHandler);
  }, [addMessage, conversations, friend.user_id, on, off]);

  const handleSubmit = () => {
    if (!message?.trim()) return;

    const createMessageDto: CreateMessageDto = {
      content: message,
      target_id: friend.user_id,
      ...(parentMessage && { reply_to_message_id: parentMessage.id }),
    };

    mutateCreateMessage(createMessageDto, {
      onSuccess: (data: Message) => {
        if (data) {
          emit("sendMessage", {
            newMessage: data,
            target_id: createMessageDto.target_id,
          });
          setHasNewMessage(conversations[friend.user_id]?.id, true);
          setTimeout(() => {
            setHasNewMessage(conversations[friend.user_id]?.id, false);
          }, 800);
          setMessage("");
          setParentMessage(null);
          if (inputRef.current) inputRef.current.blur();
        }
      },
    });
  };

  return (
    <>
      {user && (
        <div
          className="w-full p-2 border-t border-t-black/10
         flex items-center justify-between md:gap-2 gap-1
         dark:border-t-white/40"
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
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            endContent={
              message?.trim() !== "" ? (
                <SendHorizonalIcon
                  className="cursor-pointer opacity-60 hover:opacity-100 duration-250 ease-in-out
          transition-opacity"
                  onClick={handleSubmit}
                />
              ) : null
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
      )}
    </>
  );
};

export default ChatBoxInput;
