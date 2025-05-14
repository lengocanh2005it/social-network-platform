"use client";
import { useAppStore } from "@/store";
import React from "react";

const VerifyOTPHeader = () => {
  const { method } = useAppStore();

  return (
    <div className="flex flex-col md:gap-1 text-center items-center justify-center">
      <h1 className="text-xl font-semibold">Enter the verification code</h1>

      <p className="text-gray-600">
        We&apos;ve sent a verification code to your{" "}
        {method === "email" ? "email" : "phone number"}. Please enter it below
        to continue setting up two-factor authentication.
      </p>
    </div>
  );
};

export default VerifyOTPHeader;
