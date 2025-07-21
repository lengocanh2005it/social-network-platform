"use client";
import ProfilePhotos from "@/components/ProfilePhotos";
import { useGetPhotosOfUser } from "@/hooks";
import { useUserStore } from "@/store";
import { Photo } from "@/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProfilePhotosSection: React.FC = () => {
  const { viewedUser, user } = useUserStore();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { data, isLoading } = useGetPhotosOfUser(
    (user?.id === viewedUser?.id ? user?.id : viewedUser?.id) ?? "",
    {
      username: viewedUser?.profile?.username ?? "",
    },
  );

  useEffect(() => {
    if (data) {
      setPhotos(data?.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setPhotos, setNextCursor]);

  return (
    <section className="w-full flex flex-col md:gap-2 gap-1 dark:text-white text-black">
      <div className="flex items-center justify-between">
        <h1 className="font-medium md:text-xl text-lg">Photos</h1>

        {!isLoading && nextCursor && (
          <Link
            href={
              (viewedUser?.id === user?.id
                ? `/profile/${user?.profile?.username}`
                : `/profile/${viewedUser?.profile?.username}`) + "?tab=photos"
            }
            className="text-blue-700 dark:text-blue-500 hover:underline"
          >
            See all photos
          </Link>
        )}
      </div>

      <ProfilePhotos
        photos={photos}
        isLoading={isLoading}
        nextCursor={nextCursor}
      />
    </section>
  );
};

export default ProfilePhotosSection;
