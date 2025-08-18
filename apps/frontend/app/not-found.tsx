"use client";
import { useMutateGetProfileFallback } from "@/hooks";
import { getMe } from "@/lib/api/users";
import { FullUserType, useUserStore } from "@/store";
import { Button } from "@heroui/react";
import { RoleEnum } from "@repo/db";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const { mutate, isPending: isMutateGetProfileFallbackPending } =
    useMutateGetProfileFallback();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = async () => {
    if (!user || !user?.profile || !user?.profile?.username) {
      console.log("Hello World!");
      mutate(undefined, {
        onSuccess: (data: FullUserType) => {
          if (data) {
            setUser(data);
            if (data?.role === RoleEnum.admin) {
              router.push("/dashboard");
            } else {
              router.push("/home");
            }
          }
        },
        onError: () => {
          router.push("/auth/sign-in");
          return;
        },
      });
    }

    if (user?.profile?.username) {
      try {
        setIsPending(true);
        const res = await getMe({
          includeProfile: true,
          includeEducations: true,
          includeWorkPlaces: true,
          includeSocials: true,
          username: user.profile.username,
        });

        if (res) {
          setUser(res);
          if (res?.role === RoleEnum.admin) {
            router.push("/dashboard");
          } else {
            router.push("/home");
          }
        }
      } finally {
        setIsPending(false);
      }
    } else router.push("/auth/sign-in");
  };

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isAdmin = user?.role === RoleEnum.admin;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white 
    text-black md:p-6 p-4 text-center md:gap-3 gap-2 dark:bg-black dark:text-white"
    >
      <div
        className="relative md:w-[300px] md:h-[300px] w-[250px] h-[250px] flex 
        items-center justify-center
     flex-col select-none"
      >
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={
            currentTheme === "dark"
              ? "/pages/404-page-not-found-dark-mode.png"
              : "/pages/404-page-not-found.jpg"
          }
          alt="Page Not Found"
          fill
          priority
          className="object-cover dark:bg-black dark:text-white"
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center md:gap-3 gap-2">
        <h1 className="md:text-4xl text-2xl font-bold text-gray-800 dark:text-white/80">
          Oops! Page Not Found
        </h1>

        <p className="text-gray-600 text-center md:text-medium text-sm dark:text-white/60">
          Sorry, the page you are looking for doesn&apos;t exist. You can always
          go back to the {isAdmin ? "dashboard page" : "homepage"}.
        </p>

        <Button
          onPress={handleClick}
          className="px-6 py-3 bg-black/80 dark:bg-white/80 ease-in-out duration-250
          text-white dark:text-black rounded-full hover:bg-black 
          dark:hover:bg-white transition"
          isLoading={isPending || isMutateGetProfileFallbackPending}
        >
          Back to {isAdmin ? "Dashboard" : "Home"}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
