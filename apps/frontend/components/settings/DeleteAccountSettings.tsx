"use client";
import OTPVerification2FaModal from "@/components/modal/OTPVerification2FaModal";
import { useDeleteMyAccount, useVerify2Fa } from "@/hooks";
import { useUserStore } from "@/store";
import { Verify2FaActionEnum, Verify2FaType } from "@/utils";
import { Button } from "@heroui/react";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const DeleteAccountSettings: React.FC = () => {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { mutate: mutateVerify2Fa, isPending } = useVerify2Fa();
  const { mutate: mutateDeleteMyAccount, isPending: isDeleteAccountPending } =
    useDeleteMyAccount();
  const router = useRouter();

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

    mutateVerify2Fa(verify2FaDto, {
      onSuccess: (data) => {
        if (data) {
          mutateDeleteMyAccount(undefined, {
            onSuccess: (data: { success: boolean; message: string }) => {
              if (data.success && data.message.trim()) {
                router.push("/auth/sign-in");
                toast.success(data.message, {
                  position: "top-right",
                });
              }
            },
          });
          setIsOpen(false);
        }
      },
    });
  };

  return (
    <>
      <section className="relative flex flex-col">
        <div className="flex flex-col relative gap-1">
          <h2 className="text-xl font-semibold">Account Deletion</h2>
          <p className="text-gray-600 mb-4 dark:text-white/80">
            Please note that deleting your account will erase all your data. If
            you&apos;re sure, you can proceed below.
          </p>
        </div>

        <div className="flex flex-col relative md:gap-2 gap-1 w-fit">
          {isDeleteAccountPending ? (
            <>
              <Button color="primary" isLoading>
                Please wait...
              </Button>
            </>
          ) : (
            <Button
              startContent={<TrashIcon />}
              color="danger"
              isDisabled={!user?.two_factor_enabled}
              className="w-fit"
              onPress={() => setIsOpen(true)}
            >
              Delete Account
            </Button>
          )}

          {!user?.two_factor_enabled && (
            <p className="text-gray-600 dark:text-white/70">
              To delete your account, please enable 2FA by going to the{" "}
              <strong>Security</strong> tab.
            </p>
          )}
        </div>
      </section>

      {isOpen && user && user.email && (
        <OTPVerification2FaModal
          open={isOpen}
          email={user.email}
          onClose={() => setIsOpen(false)}
          action={Verify2FaActionEnum.OTHER}
          isLoading={isPending}
          actionDescription="delete your account"
          onVerify={handleVerify2Fa}
        />
      )}
    </>
  );
};

export default DeleteAccountSettings;
