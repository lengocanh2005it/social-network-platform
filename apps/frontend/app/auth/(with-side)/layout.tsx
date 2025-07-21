import SideCredentials from "@/components/SideCredentials";
import React from "react";

export default function AuthWithSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="flex md:flex-row flex-col md:px-10 px-4 py-4 md:h-screen 
    bg-white text-black dark:bg-black dark:text-white mx-auto w-full 
    justify-between md:gap-8 gap-6 items-center"
    >
      <SideCredentials />

      {children}
    </main>
  );
}
