"use client";
import { useAppStore } from "@/store";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import React from "react";

const AccountSuspendedModal: React.FC = () => {
  const { setIsAccountSuspendedModalOpen, isAccountSuspendedModalOpen } =
    useAppStore();

  return (
    <Modal
      backdrop="opaque"
      isOpen={isAccountSuspendedModalOpen}
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
      placement="center"
      onOpenChange={() =>
        setIsAccountSuspendedModalOpen(!isAccountSuspendedModalOpen)
      }
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-red-600 items-center text-center">
              Account Suspended
            </ModalHeader>
            <ModalBody className="flex flex-col items-center text-center">
              <p className="font-semibold">Your account has been suspended.</p>
              <p className="text-black/80 dark:text-white/70">
                Reason:{" "}
                <span className="italic text-black dark:text-white">
                  Violation of terms of service
                </span>
              </p>
              <p className="text-black/80 dark:text-white/90">
                If you believe this is a mistake or you would like to appeal,
                please contact our administrator at{" "}
                <span className="font-medium underline text-black dark:text-white">
                  {process.env.NEXT_PUBLIC_ADMIN_EMAIL ??
                    "admin123@example.com"}
                </span>
                .
              </p>
            </ModalBody>
            <ModalFooter className="w-fit mx-auto">
              <Button
                color="primary"
                className="dark:bg-white dark:text-black"
                onPress={onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AccountSuspendedModal;
