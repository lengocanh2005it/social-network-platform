"use client";
import SessionExpiredPage from "@/app/auth/session-expired/page";
import NotFoundPage from "@/app/not-found";
import SocialForm from "@/components/form/SocialForm";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { useGetInfoOAuthCallback } from "@/hooks";
import { generateToken } from "@/lib/api/auth";
import { useAppStore } from "@/store";
import {
  DeviceDetails,
  generateUUID,
  GetInfoOAuthCallbackDto,
  isValidCode,
  isValidURL,
  isValidUUID,
} from "@/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const CallbackSocialPage = () => {
  const searchParams = useSearchParams();
  const [isValid, setIsValid] = useState<boolean>(true);
  const { mutate: mutateGetInfoOAuthCallback, isPending } =
    useGetInfoOAuthCallback();
  const [fingerprint, setFingerprint] = useState<string>("");
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(
    null,
  );
  const { authMethod, oAuthNames, hasHydrated } = useAppStore();
  const [expired, setExpired] = useState(false);
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const hasStartedOAuth = sessionStorage.getItem("oauth-in-progress");

    if (!hasStartedOAuth) {
      const getToken = async (payload: string) => {
        const response = await generateToken({
          payload,
        });

        if (response?.token) setToken(response.token);
      };

      const payload = generateUUID();

      getToken(payload);

      setExpired(true);

      return;
    }

    if (!hasHydrated) return;

    const sessionState = searchParams.get("session_state");

    const iss = searchParams.get("iss");

    const code = searchParams.get("code");

    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();

      const result = await fp.get();

      setFingerprint(result.visitorId);
    };

    loadFingerprint();

    const fetchDeviceDetails = async () => {
      const response = await fetch("/api/device-details");

      const data = await response.json();

      setDeviceDetails(data);
    };

    fetchDeviceDetails();

    if (
      typeof sessionState !== "string" ||
      !isValidUUID(sessionState) ||
      typeof iss !== "string" ||
      !isValidURL(iss) ||
      typeof code !== "string" ||
      !isValidCode(code)
    ) {
      setIsValid(false);
    } else {
      if (!authMethod) return;

      const getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto = {
        iss,
        code,
        authMethod,
      };

      if (!expired) {
        mutateGetInfoOAuthCallback(getInfoOAuthCallbackDto);

        sessionStorage.removeItem("oauth-in-progress");
      }
    }

    return () => {
      sessionStorage.setItem("oauth-in-progress", "true");
    };
  }, [
    searchParams,
    hasHydrated,
    token,
    authMethod,
    expired,
    mutateGetInfoOAuthCallback,
  ]);

  useEffect(() => {
    sessionStorage.setItem("oauth-in-progress", "true");

    return () => {
      sessionStorage.setItem("oauth-in-progress", "true");
    };
  }, []);

  if (!isValid) {
    return <NotFoundPage />;
  }

  if (expired && token) {
    return <SessionExpiredPage token={token} />;
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      <section
        className="flex flex-col md:px-10 px-4 py-4 bg-white text-black min-h-screen
      mx-auto w-full items-center justify-center"
      >
        {!(fingerprint && deviceDetails) ||
        authMethod === "sign-in" ||
        isPending ? (
          <LoadingComponent />
        ) : (
          <>
            <div
              className="flex flex-col justify-center items-center gap-8 md:w-1/2 w-full p-8 py-6
      rounded-lg shadow-md"
            >
              <div className="text-center w-full flex flex-col items-center justify-center md:gap-2 gap-1">
                <h1 className="md:text-2xl text-xl">
                  Hello, {oAuthNames?.first_name} {oAuthNames?.last_name}!
                </h1>

                <p className="md:text-sm text-[14px] text-black/60">
                  Almost there! Please provide a few more details to complete
                  your registration.
                </p>
              </div>

              <SocialForm
                finger_print={fingerprint}
                deviceDetails={deviceDetails}
              />
            </div>
          </>
        )}
      </section>
    </Suspense>
  );
};

export default CallbackSocialPage;
