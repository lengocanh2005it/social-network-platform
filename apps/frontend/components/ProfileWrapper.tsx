"use client";
import LoadingComponent from "@/components/loading/LoadingComponent";
import HomeNav from "@/components/nav/HomeNav";
import FriendsTab from "@/components/tabs/FriendsTab";
import { useGetProfile } from "@/hooks";
import { useUserStore } from "@/store";
import { Button } from "@heroui/react";
import { HomeIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

interface ProfileWrapperProps {
  username: string;
  header: React.ReactNode;
  intro: React.ReactNode;
  posts: React.ReactNode;
  photos: React.ReactNode;
  friends: React.ReactNode;
}

const ProfileWrapper: React.FC<ProfileWrapperProps> = ({
  username,
  header,
  intro,
  posts,
  photos,
  friends,
}) => {
  const { setViewedUser, setRelationship, viewedUser } = useUserStore();
  const params = useSearchParams();
  const router = useRouter();

  const tab = params.get("tab");

  const { data, isLoading, isSuccess } = useGetProfile(username, {
    includeProfile: true,
    includeEducations: true,
    includeSocials: true,
    includeWorkPlaces: true,
    username,
  });

  useEffect(() => {
    if (data) {
      setViewedUser(data);
    } else setViewedUser(null);

    if (data?.relationship) setRelationship(data.relationship);
  }, [data, setViewedUser, setRelationship]);

  if (isLoading) return <LoadingComponent />;

  if (isSuccess && !data) {
    return (
      <section
        className="relative w-full h-screen mt-20 pb-10 flex flex-col 
        items-center justify-center text-center md:gap-4 gap-2"
      >
        <div className="md:w-[250px] md:h-[250px] w-[300px] h-[300px] relative select-none">
          <Image
            src="/profile-not-found.jpg"
            alt="Profile Not Found"
            fill
            priority
          />
        </div>

        <div className="flex flex-col md:gap-3 gap-2">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Profile Not Found
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            We couldn&apos;t find the user you&apos;re looking for. They might
            have deleted their profile or the link is incorrect.
          </p>

          <Button
            color="primary"
            onPress={() => router.push("/home")}
            startContent={<HomeIcon />}
            className="w-fit mx-auto"
          >
            Go back home
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {viewedUser ? (
        <main className="flex w-full flex-col min-h-screen text-black scroll-smooth relative">
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
              {tab !== "friends" ? (
                <>
                  <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                      {intro}
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                      {photos}
                    </div>
                    <div className="sticky top-20 bg-white rounded-lg shadow p-4">
                      {friends}
                    </div>
                  </div>

                  <div className="w-full md:w-2/3">{posts}</div>
                </>
              ) : (
                <FriendsTab />
              )}
            </div>
          </section>
        </main>
      ) : (
        <LoadingComponent />
      )}
    </>
  );
};

export default ProfileWrapper;
