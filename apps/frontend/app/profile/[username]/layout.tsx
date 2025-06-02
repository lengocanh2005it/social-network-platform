import NotFoundPage from "@/app/not-found";
import ProfileWrapper from "@/components/ProfileWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Social Network Platform",
  description: "",
};

export default async function ProfileLayout({
  friends,
  header,
  intro,
  posts,
  photos,
  params,
}: {
  friends: React.ReactNode;
  header: React.ReactNode;
  intro: React.ReactNode;
  posts: React.ReactNode;
  photos: React.ReactNode;
  params: Promise<{ username?: string }>;
}) {
  const resolvedParams = await params;

  return (
    <>
      {!resolvedParams.username || resolvedParams.username?.trim() === "" ? (
        <NotFoundPage />
      ) : (
        <ProfileWrapper
          username={resolvedParams.username}
          friends={friends}
          intro={intro}
          header={header}
          photos={photos}
          posts={posts}
        />
      )}
    </>
  );
}
