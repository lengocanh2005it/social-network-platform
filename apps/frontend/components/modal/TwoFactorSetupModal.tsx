"use client";
import AccountVerification from "@/components/AccountVerification";
import VerifyOTPForm from "@/components/form/VerifyOTPForm";
import TwoFAQrCode from "@/components/TwoFAQrCode";
import { useGenerate2Fa } from "@/hooks";
import { verifyAccountOwnership } from "@/lib/api/auth";
import { useAppStore, useUserStore } from "@/store";
import { handleAxiosError, VerifyOwnershipOtpType } from "@/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

const TwoFactorSetupModal = () => {
  const {
    is2FAModalOpen,
    setIs2FAModalOpen,
    setIs2FAEnabled,
    method,
    setMethod,
    setIsVerifiedFor2FA,
    isVerifiedFor2FA,
    accountOwnershipOtp,
    qrCodeDataUrl,
  } = useAppStore();
  const { user } = useUserStore();
  const { mutate: mutateGenerate2Fa } = useGenerate2Fa();

  const handleClose = () => {
    setIs2FAModalOpen(false);
    setIs2FAEnabled(false);
    setIsVerifiedFor2FA(false);
    setMethod(null);
  };

  const handleClickSubmit = async () => {
    if (!accountOwnershipOtp || accountOwnershipOtp?.length !== 6) return;

    const verifyOwnershipOtpDto: VerifyOwnershipOtpType = {
      otp: accountOwnershipOtp,
      method: method === "email" ? "email" : "sms",
      ...(method === "phone_number"
        ? { phone_number: user?.profile?.phone_number as string }
        : { email: user?.email as string }),
    };

    try {
      const response = await verifyAccountOwnership(verifyOwnershipOtpDto);

      if (response && response?.success === true) mutateGenerate2Fa();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={is2FAModalOpen}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      shouldBlockScroll={false}
      placement="center"
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
      onOpenChange={handleClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Set Up Two-Factor Authentication
            </ModalHeader>

            <ModalBody>
              {!method && !isVerifiedFor2FA && <AccountVerification />}
              {method && <VerifyOTPForm />}
              {isVerifiedFor2FA && qrCodeDataUrl.length !== 0 && (
                <TwoFAQrCode qrCodeUrl={qrCodeDataUrl} />
              )}
            </ModalBody>

            {!isVerifiedFor2FA && (
              <ModalFooter className="flex items-center justify-center">
                <Button color="primary" onPress={handleClose}>
                  Close
                </Button>

                {accountOwnershipOtp.length === 6 && (
                  <Button color="primary" onPress={handleClickSubmit}>
                    Submit
                  </Button>
                )}
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TwoFactorSetupModal;
