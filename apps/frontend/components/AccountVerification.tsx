"use client";
import { sendOtp } from "@/lib/api/auth";
import { useAppStore, useUserStore } from "@/store";
import { formatPhoneNumber, handleAxiosError, SendOtpType } from "@/utils";
import { Button } from "@heroui/react";
import { Mail, Phone } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const AccountVerification = () => {
  const { user } = useUserStore();
  const { setMethod } = useAppStore();
  const [selectedMethod, setSelectedMethod] = useState<
    "email" | "phone_number" | null
  >(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSelect = (method: "email" | "phone_number") => {
    setSelectedMethod((prev) => (prev === method ? null : method));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    await handleSendOtp();
  };

  const handleSendOtp = async () => {
    try {
      setIsPending(true);
      const sendOtpDto: SendOtpType = {
        method: selectedMethod === "email" ? "email" : "sms",
        type: "verify",
        ...(selectedMethod === "phone_number"
          ? { phone_number: user?.profile?.phone_number as string }
          : { email: user?.email as string }),
      };

      const response = await sendOtp(sendOtpDto);

      if (response && response?.success === true) {
        toast.success(
          `We have sent a verification code to your ${
            selectedMethod === "phone_number" ? "phone number" : "email"
          }. Please check your ${selectedMethod === "email" ? "email" : "messages"}.`,
        );

        setMethod(selectedMethod);
      }
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="flex flex-col md:gap-5 gap-4 items-center justify-center text-center">
      <div className="flex flex-col md:gap-1">
        <h1 className="text-xl font-semibold">Verify Your Identity</h1>

        <p className="text-gray-600 md:max-w-lg w-full dark:text-white/70">
          For your security, please verify your identity before setting up
          two-factor authentication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-3">
          <label className="text-sm text-center font-medium text-gray-700 dark:text-white/80">
            Choose a method to receive your verification code
          </label>

          <div
            onClick={() => handleSelect("email")}
            className={`cursor-pointer select-none border rounded-lg p-4 text-left 
              flex flex-col gap-1 transition ${
                selectedMethod === "email"
                  ? "border-blue-600 bg-blue-50 dark:border-white/40 dark:bg-white/10"
                  : "border-gray-600 hover:border-gray-700"
              }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <Mail />
              Send code to email
            </div>
            <p className="text-sm text-gray-800 break-all dark:text-white/70">
              An OTP will be sent to email{" "}
              <span className="font-medium text-gray-600 italic dark:text-white/60">
                {user?.email}.
              </span>
            </p>
          </div>

          <div
            onClick={() => handleSelect("phone_number")}
            className={`cursor-pointer select-none border rounded-lg p-4 text-left flex 
              flex-col gap-1 transition ${
                selectedMethod === "phone_number"
                  ? "border-blue-600 bg-blue-50 dark:border-white/40 dark:bg-white/10"
                  : "border-gray-600 hover:border-gray-700"
              }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <Phone />
              Send code to phone
            </div>
            <p className="text-sm text-gray-800 break-all dark:text-white/70">
              An OTP will be sent to phone number{" "}
              <span className="font-medium text-gray-600 italic dark:text-white/60">
                {user &&
                  user.profile &&
                  formatPhoneNumber(user.profile.phone_number)}
                .
              </span>
            </p>
          </div>
        </div>

        {selectedMethod && (
          <Button
            type="submit"
            color="primary"
            className="w-1/2 mx-auto dark:bg-black dark:text-white 
            dark:border dark:border-gray-700"
            isLoading={isPending}
          >
            Send Verification Code
          </Button>
        )}
      </form>
    </section>
  );
};

export default AccountVerification;
