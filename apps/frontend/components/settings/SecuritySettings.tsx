import ChangePasswordForm from "@/components/form/ChangePasswordForm";
import Disable2FAConfirmModal from "@/components/modal/Disable2FAConfirmModal";
import OTPVerification2FaModal from "@/components/modal/OTPVerification2FaModal";
import TwoFactorSetupModal from "@/components/modal/TwoFactorSetupModal";
import { getMe } from "@/lib/api/users";
import { useAppStore, useUserStore } from "@/store";
import { Button, Switch } from "@heroui/react";
import { LockKeyholeOpen } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const { user, setUser } = useUserStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleToggle2FA = () => {
    if (!is2FAEnabled) setIs2FAModalOpen(true);
    else setIsDisable2FaClick(true);
  };

  useEffect(() => {
    if (user) setIs2FAEnabled(user?.two_factor_enabled);
  }, [user, setIs2FAEnabled]);

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
      <p className="text-gray-600 mb-4">
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
              onPress={() => setShowPasswordForm(true)}
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
            <span className="text-sm text-gray-500">
              {is2FAEnabled ? "2FA is enabled" : "2FA is disabled"}
            </span>
          </div>
        </div>
      )}

      {is2FAModalOpen && <TwoFactorSetupModal />}

      {isDisable2FaClick && <Disable2FAConfirmModal />}

      {isConfirmDisable2Fa && (
        <OTPVerification2FaModal
          open={isConfirmDisable2Fa}
          onClose={() => {
            setIsDisable2FaClick(false);
            setIsConfirmDisable2Fa(false);
          }}
          actionDescription="disable two-factor authentication"
          onVerifySuccess={async () => {
            const data = await getMe({
              includeProfile: true,
              includeEducations: true,
              includeWorkPlaces: true,
              includeSocials: true,
            });

            if (data) setUser(data);

            toast.success(
              "Two-factor authentication has been disabled. Your account is now less secure.",
              {
                position: "bottom-right",
              },
            );
          }}
        />
      )}
    </>
  );
};

export default SecuritySettings;
