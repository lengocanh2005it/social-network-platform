"use client";
import NotFoundPage from "@/app/not-found";
import ResetPasswordForm from "@/components/form/ResetPasswordForm";
import ResetPasswordSuccess from "@/components/ResetPasswordSuccess";
import { useAppStore } from "@/store";
import { isValidJWT } from "@/utils";
import { useSearchParams } from "next/navigation";
import React from "react";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const { isPasswordResetSuccess } = useAppStore();

  const authorizationCode = searchParams.get("authorization_code");

  if (
    !authorizationCode ||
    (authorizationCode && !isValidJWT(authorizationCode))
  )
    return <NotFoundPage />;

  return (
    <main
      className="flex flex-col px-10 py-4 bg-white text-black h-screen mx-auto w-full items-center
justify-center"
    >
      {isPasswordResetSuccess ? (
        <>
          <ResetPasswordSuccess />
        </>
      ) : (
        <>
          <div
            className="flex flex-col justify-center items-center gap-8 md:w-1/2 w-full p-8 py-6
  rounded-lg shadow-sm"
          >
            <div className="text-center w-full flex flex-col items-center justify-center">
              <h1 className="md:text-2xl text-xl">Reset Your Password</h1>

              <p className="md:text-sm text-[14px] text-black/60">
                Please enter your new password and confirm it below to reset
                your account password.
              </p>
            </div>

            <ResetPasswordForm authorize_code={authorizationCode} />
          </div>
        </>
      )}
    </main>
  );
};

export default ResetPasswordPage;
