"use client";
import { useUpdateUserSuspension } from "@/hooks";
import { useUserStore } from "@/store";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { LockIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const SuspendAccountModal: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [step, setStep] = useState<"confirm" | "reason">("confirm");
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { mutate, isPending } = useUpdateUserSuspension();
  const { viewedUser, setViewedUser } = useUserStore();

  const handleCancel = () => {
    setStep("confirm");
    setError("");
    setReason("");
    onOpenChange();
  };

  return (
    <>
      <LockIcon
        onClick={onOpen}
        className="cursor-pointer opacity-70 hover:opacity-100 duration-250"
      />

      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setStep("confirm");
          }
          onOpenChange();
        }}
        isDismissable={false}
        isKeyboardDismissDisabled
        backdrop="opaque"
        placement="center"
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
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Lock Account
              </ModalHeader>

              <ModalBody className="text-center">
                <p>
                  Are you sure you want to suspend this user&apos;s account?
                </p>
                <p className="text-sm text-default-500">
                  This action can be reversed later.
                </p>

                {step === "reason" && (
                  <div
                    className="flex flex-col text-left items-start justify-start
                  gap-1"
                  >
                    <p>Reason</p>

                    <Textarea
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter the reason for suspension..."
                      isInvalid={!!error}
                      errorMessage={error}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="mx-auto w-fit">
                <Button variant="light" onPress={handleCancel}>
                  Cancel
                </Button>

                {isPending ? (
                  <>
                    <Button isLoading color="primary">
                      Please wait...
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      color={`${step == "reason" ? "danger" : "primary"}`}
                      onPress={() => {
                        if (step === "reason") {
                          if (!reason.trim()) {
                            setError("Reason is required");
                            return;
                          }

                          if (!viewedUser) return;

                          mutate(
                            {
                              userId: viewedUser.id,
                              updateUserSuspensionDto: {
                                is_suspended: true,
                                reason,
                              },
                            },
                            {
                              onSuccess: (
                                data: Record<
                                  string,
                                  string | Record<string, string | number>
                                >,
                              ) => {
                                if (data) {
                                  onOpenChange();
                                  setViewedUser({
                                    ...viewedUser,
                                    profile: {
                                      ...viewedUser.profile,
                                      status: "inactive",
                                    },
                                  });
                                  if (
                                    data?.message &&
                                    typeof data?.message === "string"
                                  )
                                    toast.success(data?.message, {
                                      position: "bottom-right",
                                    });
                                }
                              },
                            },
                          );
                        } else {
                          setStep("reason");
                        }
                      }}
                    >
                      {step === "reason" ? "Submit" : "Next"}
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SuspendAccountModal;
