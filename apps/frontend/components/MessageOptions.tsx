"use client";
import EditMessageModal from "@/components/modal/EditMessageModal";
import { useDeleteMessage } from "@/hooks";
import { useConversationStore } from "@/store";
import { DeleteMessageDto, Message } from "@/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Ellipsis, SquarePen, TrashIcon } from "lucide-react";
import React, { useState } from "react";

interface MessageOptionsProps {
  message: Message;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({ message }) => {
  const [clickedEditMessage, setClickedEditMessage] = useState<boolean>(false);
  const { mutate: mutateDeleteMessage } = useDeleteMessage();
  const { updateMessage } = useConversationStore();

  const handleClickEditMessage = () => {
    setClickedEditMessage(true);
  };

  const handleClickDeleteMessage = () => {
    const deleteMessageDto: DeleteMessageDto = {
      messageId: message.id,
      conversationId: message.conversation_id,
    };

    mutateDeleteMessage(deleteMessageDto, {
      onSuccess: (data: Message) => {
        if (data) {
          updateMessage(message.conversation_id, message.id, data);
        }
      },
    });
  };

  return (
    <>
      <Dropdown
        placement="bottom-end"
        className="text-black dark:text-white"
        shouldBlockScroll={false}
      >
        <DropdownTrigger>
          <Ellipsis
            size={20}
            className="opacity-0 group-hover:opacity-100 transition-opacity 
            cursor-pointer focus:outline-none"
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Messages Actions">
          <DropdownItem
            key="edit-message"
            startContent={<SquarePen />}
            onClick={handleClickEditMessage}
          >
            Edit Message
          </DropdownItem>
          <DropdownItem
            key="delete-message"
            startContent={<TrashIcon />}
            onClick={handleClickDeleteMessage}
          >
            Delete Message
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {clickedEditMessage && (
        <EditMessageModal
          isOpen={clickedEditMessage}
          setIsOpen={setClickedEditMessage}
          message={message}
        />
      )}
    </>
  );
};

export default MessageOptions;
