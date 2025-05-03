import HomeNav from "@/components/nav/HomeNav";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Social Network Platform",
  description: "",
};

export default function HomeLayout({
  menu,
  feed,
  sidebar,
}: {
  menu: React.ReactNode;
  feed: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <main className="flex w-full flex-col min-h-screen bg-white text-black">
      <div className="h-16 fixed w-full z-[50]">
        <HomeNav shouldShowIndicator />
      </div>

      <section className="relative w-full mt-24">
        <aside
          className="w-1/4 p-4 fixed top-20 left-0 bg-white z-10 
            h-[calc(98vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out"
        >
          {menu}
        </aside>

        <main className="ml-[25%] mr-[25%] p-4">{feed}</main>

        <aside
          className="w-1/4 p-4 fixed top-20 right-0 bg-white z-10 
        h-[calc(98vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out"
        >
          {sidebar}
        </aside>
      </section>
    </main>
  );
}
