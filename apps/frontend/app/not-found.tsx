"use client";
import { useAppStore } from "@/store";
import { getCookie } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const NotFoundPage = () => {
  const { isLoggedIn, setIsLoggedIn } = useAppStore();

  useEffect(() => {
    const isLoggedInCookie = getCookie("logged_in");

    if (isLoggedInCookie) setIsLoggedIn(true);
    else setIsLoggedIn(false);
  }, [setIsLoggedIn]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white 
    text-black md:p-6 p-4 text-center md:gap-3 gap-2"
    >
      <div
        className="relative md:w-[300px] md:h-[300px] w-[250px] h-[250px] flex 
        items-center justify-center
     flex-col select-none"
      >
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src="/pages/404-page-not-found.jpg"
          alt="Page Not Found"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center md:gap-3 gap-2">
        <h1 className="md:text-4xl text-2xl font-bold text-gray-800">
          Oops! Page Not Found
        </h1>

        <p className="text-gray-600 text-center md:text-medium text-sm">
          Sorry, the page you are looking for doesn’t exist. You can always go
          back to the homepage.
        </p>

        <Link
          href={isLoggedIn ? "/home" : "/"}
          className="px-6 py-3 bg-black/80 text-white rounded-full hover:bg-black transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
