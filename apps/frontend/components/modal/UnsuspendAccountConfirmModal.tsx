"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { UnlockIcon } from "lucide-react";
import { useUpdateUserSuspension } from "@/hooks";
import { FullUserType, useUserStore } from "@/store";
import toast from "react-hot-toast";

interface UnsuspendAccountConfirmModalProps {
  viewedUser: FullUserType;
}

const UnsuspendAccountConfirmModal: React.FC<
  UnsuspendAccountConfirmModalProps
> = ({ viewedUser }) => {
  const { setViewedUser } = useUserStore();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { mutate: mutateUpdateUserSuspension, isPending } =
    useUpdateUserSuspension();

  const handleSubmit = () => {
    if (!viewedUser) return;

    mutateUpdateUserSuspension(
      {
        userId: viewedUser.id,
        updateUserSuspensionDto: {
          is_suspended: false,
        },
      },
      {
        onSuccess: (
          data: Record<string, string | Record<string, string | number>>,
        ) => {
          if (data) {
            onClose();
            setViewedUser({
              ...viewedUser,
              profile: {
                ...viewedUser.profile,
                status: "active",
              },
            });
            if (data?.message && typeof data?.message === "string")
              toast.success(data?.message, {
                position: "bottom-right",
              });
          }
        },
      },
    );
  };

  return (
    <>
      <Tooltip
        content="This user's account has been suspended."
        className="text-black dark:text-white"
        placement="left-start"
      >
        <UnlockIcon
          onClick={onOpen}
          className="cursor-pointer opacity-70 hover:opacity-100
      ease-in-out duration-250 focus:outline-none"
        />
      </Tooltip>

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
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Unlock Account
              </ModalHeader>
              <ModalBody className="text-center">
                <p>Are you sure you want to unlock this account?</p>
                <p className="text-sm text-default-500">
                  The user will regain access to their account immediately.
                </p>
              </ModalBody>
              <ModalFooter className="w-fit mx-auto flex items-center gap-2">
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>

                {isPending ? (
                  <Button color="primary" isLoading>
                    Please wait...
                  </Button>
                ) : (
                  <Button color="primary" onPress={handleSubmit}>
                    Submit
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UnsuspendAccountConfirmModal;
