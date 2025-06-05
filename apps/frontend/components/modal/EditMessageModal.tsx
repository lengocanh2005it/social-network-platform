"use client";
import { useUpdateMessage } from "@/hooks";
import { useConversationStore } from "@/store";
import { Message, UpdateMessageDto } from "@/utils";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import React, { useState } from "react";

interface EditMessageModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  message: Message;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  isOpen,
  setIsOpen,
  message,
}) => {
  const [newMessage, setNetMessage] = useState<string>(message.content);
  const { updateMessage } = useConversationStore();
  const { mutate: mutateUpdateMessage, isPending } = useUpdateMessage();

  const handleUpdateMessage = () => {
    if (!newMessage?.trim()) return;

    const updateMessageDto: UpdateMessageDto = {
      messageId: message.id,
      conversationId: message.conversation_id,
      content: newMessage,
    };

    mutateUpdateMessage(updateMessageDto, {
      onSuccess: (data: Message) => {
        updateMessage(message.conversation_id, message.id, data);
        setIsOpen(false);
      },
    });
  };

  return (
    <>
      <Modal
        backdrop="opaque"
        placement="center"
        shouldBlockScroll={false}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
        onOpenChange={() => setIsOpen(!isOpen)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 items-center text-center">
                Edit Message
              </ModalHeader>
              <ModalBody>
                <Input
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(e) => setNetMessage(e.target.value)}
                />
              </ModalBody>
              <ModalFooter className="flex items-center justify-center md:gap-2 gap-1">
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>

                {isPending ? (
                  <Button color="primary" isLoading>
                    Please wait...
                  </Button>
                ) : (
                  <Button color="primary" onPress={handleUpdateMessage}>
                    Submit
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      ;
    </>
  );
};

export default EditMessageModal;
