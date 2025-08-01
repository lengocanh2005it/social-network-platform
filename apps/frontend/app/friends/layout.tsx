import HomeNav from "@/components/nav/HomeNav";
import React from "react";

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="flex w-full flex-col min-h-screen bg-white text-black 
    dark:bg-black dark:text-white"
    >
      <div className="h-16 fixed w-full z-[50]">
        <HomeNav shouldShowIndicator />
      </div>

      <div className="relative w-full mt-24">{children}</div>
    </main>
  );
}
