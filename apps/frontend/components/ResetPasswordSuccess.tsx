import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ResetPasswordSuccess = () => {
  const router = useRouter();

  const handleBackToSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <section className="h-screen flex items-center justify-center bg-white text-black p-4">
      <div className="flex items-center justify-center flex-col text-center">
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src="/reset-password-success.jpg"
          alt="Reset password success"
          width={300}
          height={300}
          className="mx-auto mb-6 select-none"
        />

        <h1 className="text-2xl font-bold mb-4 text-green-600">
          Reset Password Successfully!
        </h1>

        <p className="mb-6 text-gray-600">
          Your password has been updated successfully. You can now sign in with
          your new password.
        </p>

        <Button onPress={handleBackToSignIn} color="primary">
          Sign In
        </Button>
      </div>
    </section>
  );
};

export default ResetPasswordSuccess;
