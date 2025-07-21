"use client";
import { getMe } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const { theme } = useTheme();

  const handleClick = async () => {
    if (!user || !user.profile || !user?.profile.username) router.push("/");

    if (user?.profile?.username) {
      const res = await getMe({
        includeProfile: true,
        includeEducations: true,
        includeWorkPlaces: true,
        includeSocials: true,
        username: user.profile.username,
      });

      if (res) {
        setUser(res);
        router.push("/home");
      }
    } else router.push("/");
  };

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
          src={`${theme === "dark" || theme === "system" ? "/pages/404-page-not-found-dark-mode.png" : "/pages/404-page-not-found.jpg"}`}
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
          go back to the homepage.
        </p>

        <Button
          onPress={handleClick}
          className="px-6 py-3 bg-black/80 dark:bg-white/80 ease-in-out duration-250
          text-white dark:text-black rounded-full hover:bg-black dark:hover:bg-white transition"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
