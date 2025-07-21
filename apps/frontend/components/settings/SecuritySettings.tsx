"use client";
import ChangePasswordForm from "@/components/form/ChangePasswordForm";
import Disable2FAConfirmModal from "@/components/modal/Disable2FAConfirmModal";
import OTPVerification2FaModal from "@/components/modal/OTPVerification2FaModal";
import TwoFactorSetupModal from "@/components/modal/TwoFactorSetupModal";
import { useVerify2Fa } from "@/hooks";
import { useAppStore, useUserStore } from "@/store";
import { Verify2FaActionEnum, Verify2FaType } from "@/utils";
import { Button, Switch } from "@heroui/react";
import { LockKeyholeOpen } from "lucide-react";
import { useEffect, useState } from "react";

const SecuritySettings = () => {
  const {
    setIs2FAEnabled,
    is2FAEnabled,
    setIs2FAModalOpen,
    is2FAModalOpen,
    setIsDisable2FaClick,
    isDisable2FaClick,
    isConfirmDisable2Fa,
    setIsConfirmDisable2Fa,
  } = useAppStore();
  const { user } = useUserStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    mutate: mutateVerify2Fa,
    isPending,
    variables,
    isSuccess,
  } = useVerify2Fa();

  const handleToggle2FA = () => {
    if (!is2FAEnabled) setIs2FAModalOpen(true);
    else setIsDisable2FaClick(true);
  };

  const handleVerify2Fa = async (
    action: Verify2FaActionEnum,
    otp: string,
    email: string,
  ) => {
    const verify2FaDto: Verify2FaType = {
      otp,
      action,
      email,
    };

    mutateVerify2Fa(verify2FaDto);
  };

  useEffect(() => {
    if (user) setIs2FAEnabled(user?.two_factor_enabled);
  }, [user, setIs2FAEnabled]);

  useEffect(() => {
    if (isSuccess && variables.action === Verify2FaActionEnum.DISABLE_2FA) {
      setIsConfirmDisable2Fa(false);
    } else if (isSuccess && variables?.action === Verify2FaActionEnum.OTHER) {
      setShowPasswordForm(true);
      setIsOpen(false);
    }
  }, [isSuccess, variables, setIsConfirmDisable2Fa]);

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
      <p className="text-gray-600 mb-4 dark:text-white/70">
        Manage your password and 2FA settings.
      </p>

      {showPasswordForm ? (
        <>
          <ChangePasswordForm setShowPasswordForm={setShowPasswordForm} />
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center md:gap-3 gap-2">
            <Button
              className="w-fit px-4 py-2"
              color="primary"
              isDisabled={!is2FAEnabled}
              startContent={<LockKeyholeOpen />}
              onPress={() => setIsOpen(true)}
            >
              Change Password
            </Button>

            {!is2FAEnabled && (
              <p className="text-gray-600">
                Please enable 2FA to change your password.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              isSelected={is2FAEnabled}
              onChange={handleToggle2FA}
              color="success"
            />
            <span className="text-sm text-gray-500 dark:text-white/70">
              {is2FAEnabled ? "2FA is enabled" : "2FA is disabled"}
            </span>
          </div>
        </div>
      )}

      {is2FAModalOpen && <TwoFactorSetupModal />}

      {isDisable2FaClick && <Disable2FAConfirmModal />}

      {isConfirmDisable2Fa && user && user.email && (
        <OTPVerification2FaModal
          email={user.email}
          open={isConfirmDisable2Fa}
          action={Verify2FaActionEnum.DISABLE_2FA}
          onClose={() => {
            setIsDisable2FaClick(false);
            setIsConfirmDisable2Fa(false);
          }}
          isLoading={isPending}
          actionDescription="disable two-factor authentication"
          onVerify={handleVerify2Fa}
        />
      )}

      {isOpen && user && user.email && (
        <OTPVerification2FaModal
          open={isOpen}
          email={user.email}
          onClose={() => setIsOpen(false)}
          action={Verify2FaActionEnum.OTHER}
          isLoading={isPending}
          actionDescription="update your password"
          onVerify={handleVerify2Fa}
        />
      )}
    </>
  );
};

export default SecuritySettings;
