"use client";
import { useUpdateStoryStatus } from "@/hooks";
import { reasonOptions, Story } from "@/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Selection,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { StoryStatusEnum } from "@repo/db";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface ConfirmDeleteStoryModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  story: Story;
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfirmDeleteStoryModal: React.FC<ConfirmDeleteStoryModalProps> = ({
  isOpen,
  onOpenChange,
  story,
  setStories,
  setIsOpen,
}) => {
  const [reason, setReason] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const { mutate: mutateUpdateStoryStatus, isPending } = useUpdateStoryStatus();

  const handleSelectChange = (keys: Selection) => {
    if (keys === "all") return;

    if (keys.size === 0) {
      setSelectedKey(undefined);
      setReason("");
      return;
    }

    const key = Array.from(keys)[0]?.toString();
    setSelectedKey(key);

    const selected = reasonOptions.find((item) => item.key === key);
    if (selected) {
      setReason(selected.label);
    }
  };

  const handleConfirmClick = () => {
    if (!reason?.trim()) return;

    mutateUpdateStoryStatus(
      {
        storyId: story.id,
        updateStoryStatusDto: {
          reason,
          status: StoryStatusEnum.inactive,
        },
      },
      {
        onSuccess: (data, variables) => {
          if (data?.success && typeof data?.message === "string") {
            setStories((prevStories) =>
              prevStories.map((story) =>
                story.id === variables.storyId
                  ? {
                      ...story,
                      status: variables.updateStoryStatusDto.status,
                    }
                  : story,
              ),
            );
            onOpenChange(false);
            setIsOpen(false);
            toast.success(data.message, {
              position: "bottom-right",
            });
          }
        },
      },
    );
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" },
          },
        },
      }}
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center text-center">
              Confirm Hide Story
            </ModalHeader>
            <ModalBody className="flex flex-col md:gap-2 gap-1">
              <p className="dark:text-white/80 text-black/80">Reason</p>

              <div className="flex flex-col md:gap-3 gap-2">
                <Select
                  className="max-w-full"
                  aria-label="Reason Select"
                  placeholder="Select a reason... (Optional)"
                  selectedKeys={
                    (selectedKey ? new Set([selectedKey]) : new Set()) ?? []
                  }
                  onSelectionChange={handleSelectChange}
                  items={reasonOptions}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>

                <Textarea
                  placeholder="Or write a custom reason..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setSelectedKey(undefined);
                  }}
                  isClearable
                  onClear={() => {
                    setReason("");
                    setSelectedKey(undefined);
                  }}
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex items-center justify-center">
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="danger"
                onPress={handleConfirmClick}
                isDisabled={reason?.trim() === "" || isPending}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDeleteStoryModal;
