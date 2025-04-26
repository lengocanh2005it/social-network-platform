"use client";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const VerifyEmailSuccess = () => {
  const router = useRouter();

  const handleBackToSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <main className="h-screen flex items-center justify-center bg-white text-black p-4">
      <div className="flex items-center justify-center flex-col text-center">
        <Image
          src="/email-verified.jpg"
          alt="Email verified"
          width={300}
          height={300}
          className="mx-auto mb-6 select-none"
        />

        <h1 className="text-2xl font-bold mb-4 text-green-600">
          Email Verification Successful!
        </h1>

        <p className="mb-6 text-gray-600">
          Your account has been verified. You can now sign in to continue.
        </p>

        <Button onPress={handleBackToSignIn} color="primary">
          Sign In
        </Button>
      </div>
    </main>
  );
};

export default VerifyEmailSuccess;
