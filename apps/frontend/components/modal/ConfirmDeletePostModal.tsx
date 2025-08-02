"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button as ButtonHeroUI,
  Textarea,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { PostDetails } from "@/store";

interface ConfirmDeletePostModalProps {
  post: PostDetails;
  onDelete: (reason: string) => void;
  isPending: boolean;
}

const ConfirmDeletePostModal: React.FC<ConfirmDeletePostModalProps> = ({
  post,
  onDelete,
  isPending,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleDelete = () => {
    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }

    onDelete(reason);
    onOpenChange();
    setError("");
  };

  const fullName = `${post.user.profile.first_name} ${post.user.profile.last_name}`;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpen}
        className="text-destructive hover:bg-destructive/10 cursor-pointer"
        aria-label="Delete post"
        disabled={isPending}
      >
        <TrashIcon className="w-5 h-5" />
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();
          setError("");
          setReason("");
        }}
        placement="center"
        backdrop="blur"
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            },
            exit: {
              y: 20,
              opacity: 0,
              transition: {
                duration: 0.15,
                ease: "easeIn",
              },
            },
          },
        }}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4">
                <h2 className="text-xl font-semibold">Confirm Post Deletion</h2>
                <p className="text-sm text-default-500">
                  This action cannot be undone
                </p>
              </ModalHeader>

              <ModalBody className="py-6">
                <div className="space-y-4">
                  <p className="text-base">
                    Are you sure you want to delete the post by{" "}
                    <span className="font-medium text-danger">{fullName}</span>?
                  </p>

                  <div className="space-y-2">
                    <Textarea
                      id="delete-reason"
                      label="Reason"
                      isRequired
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (e.target.value.trim()) {
                          setError("");
                        }
                      }}
                      placeholder="Please provide a reason for deleting this post..."
                      errorMessage={error}
                      isInvalid={!!error}
                      classNames={{
                        input:
                          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        errorMessage: "text-red-500 dark:text-red-400 text-xs",
                      }}
                    />

                    <p className="text-xs text-default-500">
                      This will be visible to the post author
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-divider pt-4">
                <div className="flex justify-end gap-3 w-full">
                  <ButtonHeroUI
                    variant="light"
                    onPress={onClose}
                    isDisabled={isPending}
                  >
                    Cancel
                  </ButtonHeroUI>

                  <ButtonHeroUI
                    color="danger"
                    onPress={handleDelete}
                    isLoading={isPending}
                  >
                    {isPending ? "Deleting..." : "Delete Post"}
                  </ButtonHeroUI>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmDeletePostModal;
