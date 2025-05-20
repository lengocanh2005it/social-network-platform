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

const Disable2FAConfirmModal = () => {
  const { isDisable2FaClick, setIsDisable2FaClick, setIsConfirmDisable2Fa } =
    useAppStore();

  const handleClickCancel = () => {
    setIsDisable2FaClick(false);
  };

  const handleConfirmClick = () => {
    setIsConfirmDisable2Fa(true);
    setIsDisable2FaClick(false);
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={isDisable2FaClick}
      placement="center"
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      size="xl"
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
      onOpenChange={handleClickCancel}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Confirm Disable 2FA
            </ModalHeader>
            <ModalBody className="text-center">
              <h1 className="text-lg font-semibold text-gray-800">
                Are you sure you want to turn off two-factor authentication?
              </h1>

              <p className="text-sm text-gray-600">
                Turning off 2FA will make your account less secure. <br />
                We recommend keeping it on to help protect your account.
              </p>
            </ModalBody>
            <ModalFooter className="flex items-center justify-center">
              <Button color="primary" onPress={handleClickCancel}>
                Cancel
              </Button>

              <Button color="danger" onPress={handleConfirmClick}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Disable2FAConfirmModal;
