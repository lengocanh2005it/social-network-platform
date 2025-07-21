"use client";
import NotFoundPage from "@/app/not-found";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { isValidJWT } from "@/utils";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const VerifyEmailPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const authorizationCode = searchParams.get("authorization_code");

  if (
    !authorizationCode ||
    (authorizationCode && !isValidJWT(authorizationCode))
  ) {
    return <NotFoundPage />;
  }

  const handleBackToSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <main
      className="h-screen flex items-center justify-center bg-white text-black p-4
    dark:bg-black dark:text-white"
    >
      <div className="flex items-center justify-center flex-col text-center">
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src="/email-verified.jpg"
          alt="Email verified"
          width={300}
          height={300}
          className="mx-auto mb-6 select-none"
        />

        <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-300">
          Email Verification Successful!
        </h1>

        <p className="mb-6 text-gray-600 dark:text-white/70">
          Your account has been verified. You can now sign in to continue.
        </p>

        <Button onPress={handleBackToSignIn} color="primary">
          Sign In
        </Button>
      </div>
    </main>
  );
};

const VerifyEmailSuccess = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
};

export default VerifyEmailSuccess;
