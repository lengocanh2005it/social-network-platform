"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import React from "react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  textHeader?: string;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  textHeader = "Confirm Action",
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
  onOpenChange,
  isLoading,
}) => {
  return (
    <Modal
      backdrop="opaque"
      isOpen={open}
      placement="center"
      size="lg"
      shouldBlockScroll={false}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
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
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              {textHeader}
            </ModalHeader>

            <ModalBody className="flex flex-col">
              <h1 className="md:text-lg text-center text-lg">{title}</h1>

              <p className="text-sm text-center text-gray-700">{description}</p>
            </ModalBody>

            <ModalFooter className="flex items-center justify-center">
              <Button color="primary" onPress={onCancel}>
                {cancelText}
              </Button>

              {isLoading ? (
                <Button color="primary" isLoading>
                  Please wait...
                </Button>
              ) : (
                <Button color="danger" onPress={onConfirm}>
                  {confirmText}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
