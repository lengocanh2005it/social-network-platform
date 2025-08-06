"use client";
import { useReportPost } from "@/hooks";
import { PostDetails, usePostStore } from "@/store";
import { reasonReportOptions } from "@/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { ReportReasonEnum } from "@repo/db";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface ReportPostModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: PostDetails;
}

const ReportPostModal: React.FC<ReportPostModalProps> = ({
  isOpen,
  setIsOpen,
  post,
}) => {
  const { mutate: mutateReportPost, isPending: isReportPostPending } =
    useReportPost();
  const [selectedReason, setSelectedReason] = useState<ReportReasonEnum | null>(
    null,
  );
  const { hideHomePosts } = usePostStore();

  const handleSubmit = () => {
    if (!selectedReason) return;
    mutateReportPost(
      {
        postId: post.id,
        reason: selectedReason,
        type: "post",
      },
      {
        onSuccess: (data: { success: true; message: string }) => {
          if (data) {
            hideHomePosts(post.id);
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
      placement="center"
      isKeyboardDismissDisabled={true}
      isDismissable={false}
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
      size="lg"
      onOpenChange={() => setIsOpen(!isOpen)}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center text-center">
              Report Post
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center dark:text-white/70">
                  Please select a reason for reporting this post.
                </p>
                <Select
                  items={reasonReportOptions}
                  label="Reason"
                  placeholder="Select a reason"
                  selectedKeys={selectedReason ? [selectedReason] : []}
                  onSelectionChange={(keys) =>
                    setSelectedReason(Array.from(keys)[0] as ReportReasonEnum)
                  }
                >
                  {(reason) => (
                    <SelectItem key={reason.key}>{reason.label}</SelectItem>
                  )}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter className="flex items-center w-fit mx-auto">
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                isDisabled={!selectedReason}
                isLoading={isReportPostPending}
                onPress={handleSubmit}
              >
                {isReportPostPending ? "Please wait..." : "Submit"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReportPostModal;
