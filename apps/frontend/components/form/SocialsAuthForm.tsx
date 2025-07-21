"use client";
import { AuthMethod } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

interface SocialsAuthFormProps {
  method: AuthMethod;
}

const SocialsAuthForm: React.FC<SocialsAuthFormProps> = ({ method }) => {
  const router = useRouter();

  const socialsLogin = (provider: "google" | "facebook") => {
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    const keyCloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_AUTH_SERVER_URL;
    const keyCloakRedirectUri = process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI;
    const keyCloakClientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

    router.push(
      `${keyCloakUrl}/realms/${realm}/protocol/openid-connect/auth?response_type=code&client_id=${keyCloakClientId}&redirect_uri=${keyCloakRedirectUri}&scope=openid&kc_idp_hint=${provider}`,
    );
  };

  return (
    <div className="w-full text-center space-y-4">
      <div className="relative flex items-center justify-center">
        <hr className="md:w-1/2 w-full border-t border-gray-300" />
        <span className="absolute bg-white dark:bg-black px-3 text-sm text-gray-500 dark:text-white">
          Or {method} with
        </span>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full border
         border-gray-300 hover:bg-gray-100 dark:hover:bg-white transition cursor-pointer
         select-none"
          onClick={() => socialsLogin("google")}
        >
          <Image
            src="/icons/google.svg"
            alt="Google"
            width={24}
            height={24}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </button>

        <button
          className="flex items-center justify-center w-10 h-10 rounded-full border
         border-gray-300 hover:bg-gray-100 transition cursor-pointer dark:hover:bg-white
         select-none"
          onClick={() => socialsLogin("facebook")}
        >
          <Image
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src="/icons/facebook.svg"
            alt="Google"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};

export default SocialsAuthForm;
