"use client";
import NotFoundPage from "@/app/not-found";
import { verifyToken } from "@/lib/api/auth";
import { VerifyToken } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SessonExpiredPageProps {
  token: string;
}

export default function SessionExpiredPage({ token }: SessonExpiredPageProps) {
  const [isValidToken, setIsValidToken] = useState<boolean>(false);

  useEffect(() => {
    if (!token) setIsValidToken(false);

    const handleVerifyToken = async (verifyTokenDto: VerifyToken) => {
      const response = await verifyToken(verifyTokenDto);

      if (!response || !response.success) setIsValidToken(false);

      if (response.success) setIsValidToken(true);
    };

    handleVerifyToken({ token });
  }, [token]);

  if (!isValidToken) return <NotFoundPage />;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <Image
          src="/pages/session-expired.avif"
          alt="Session Expired"
          width={300}
          height={300}
          sizes=""
          priority
          className="mx-auto mb-6 select-none"
        />

        <h1 className="md:text-2xl text-xl font-semibold text-gray-800 mb-4">
          Session Expired
        </h1>

        <p className="text-gray-600 mb-6">
          Your login session has expired. Please restart the login process.
        </p>

        <Link
          href="/auth/sign-in"
          className="inline-block bg-black text-white px-6 py-2 rounded-md 
          hover:bg-gray-800 transition"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
