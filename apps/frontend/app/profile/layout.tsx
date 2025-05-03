import HomeNav from "@/components/nav/HomeNav";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Social Network Platform",
  description: "",
};

export default function ProfileLayout({
  friends,
  header,
  intro,
  posts,
  photos,
}: {
  friends: React.ReactNode;
  header: React.ReactNode;
  intro: React.ReactNode;
  posts: React.ReactNode;
  photos: React.ReactNode;
}) {
  return (
    <main className="flex w-full flex-col min-h-screen text-black scroll-smooth">
      <div className="h-16 fixed w-full z-50">
        <HomeNav />
      </div>

      <section className="relative w-full mt-20 pb-10">
        <div
          className="max-w-6xl mx-auto flex items-center justify-center h-fit bg-white relative
          rounded-b-lg"
        >
          {header}
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 px-4 mt-4">
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">{intro}</div>
            <div className="bg-white rounded-lg shadow p-4">{photos}</div>
            <div className="sticky top-20 bg-white rounded-lg shadow p-4">
              {friends}
            </div>
          </div>
          <div className="w-full md:w-2/3">{posts}</div>
        </div>
      </section>
    </main>
  );
}
