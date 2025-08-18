"use client";
import NotFoundPage from "@/app/not-found";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { verifyToken } from "@/lib/api/auth";
import { handleAxiosError, VerifyToken } from "@/utils";
import { Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ForbiddenContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const handleVerifyToken = async (verifyTokenDto: VerifyToken) => {
      try {
        const response = await verifyToken(verifyTokenDto);

        if (response?.success) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        handleAxiosError(error);
        setStatus("invalid");
      }
    };

    handleVerifyToken({ token });
  }, [token]);

  if (status === "loading") return <LoadingComponent />;
  if (status === "invalid") return <NotFoundPage />;
  return <ForbiddenPage />;
};

function ForbiddenPage() {
  return (
    <div className="flex h-screen items-center justify-center flex-col bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-xl text-center">
        <div className="relative w-64 h-64 mx-auto mb-8 text-white">
          <img
            src={"/icons/forbidden.svg"}
            alt="Forbidden Access"
            className="object-contain select-none w-full h-full"
          />
        </div>

        <div
          className="inline-flex items-center px-4 py-2 rounded-full 
          bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6"
        >
          <span className="font-mono font-bold text-lg">403</span>
          <span className="w-1 h-6 bg-red-400 dark:bg-red-500 mx-3"></span>
          <span className="font-medium">Forbidden</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>

        <p className="text-medium text-gray-600 dark:text-gray-300 mb-6">
          You do not have permission to access this page. Please contact the
          administrator if you believe this is a mistake.
        </p>

        <Button
          onPress={() => window.history.back()}
          aria-label="Go back to the previous page"
          className="dark:bg-white dark:text-black bg-black text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

export default ForbiddenContent;
