"use client";
import NotFoundPage from "@/app/not-found";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { verifyToken } from "@/lib/api/auth";
import { VerifyToken } from "@/utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const NotFoundContent = () => {
  const searchParams = useSearchParams();

  const [isValidToken, setIsValidToken] = useState<boolean>(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) setIsValidToken(false);

    const handleVerifyToken = async (verifyTokenDto: VerifyToken) => {
      const response = await verifyToken(verifyTokenDto);

      if (!response || !response.success) setIsValidToken(false);

      if (response.success) setIsValidToken(true);
    };

    if (token) handleVerifyToken({ token });
  }, [token]);

  if (!isValidToken) return <NotFoundPage />;

  return <NotFoundPage />;
};

const NotFound = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <NotFoundContent />
    </Suspense>
  );
};

export default NotFound;
