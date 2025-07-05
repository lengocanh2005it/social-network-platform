"use client";
import { useGetPhotosOfUser, useInfiniteScroll } from "@/hooks";
import { getPhotosOfUser } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { Photo } from "@/utils";
import { Skeleton } from "@heroui/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

export const columns = [
  { name: "ALL", uid: "id" },
  { name: "STORY", uid: "name" },
  { name: "POST", uid: "age" },
  { name: "COVER", uid: "role" },
];

const PhotosTab: React.FC = () => {
  const { viewedUser, user } = useUserStore();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { data, isLoading } = useGetPhotosOfUser(
    (user?.id === viewedUser?.id ? user?.id : viewedUser?.id) ?? "",
    {
      username: viewedUser?.profile?.username ?? "",
    },
  );
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setPhotos(data?.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setPhotos, setNextCursor]);

  const loadMore = async () => {
    if (
      !nextCursor ||
      hasMore ||
      !viewedUser?.profile ||
      !viewedUser?.profile?.username
    )
      return;

    setHasMore(true);

    try {
      const res = await getPhotosOfUser({
        username: viewedUser.profile.username,
        after: nextCursor,
      });

      if (res && res?.data) {
        setPhotos((prev) => [...prev, ...res?.data]);
        setNextCursor(res?.nextCursor ?? null);
      }
    } finally {
      setHasMore(false);
    }
  };

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <div className="bg-white rounded-lg w-full shadow p-4 flex flex-col md:gap-4 gap-3">
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="relative w-full pt-[100%] overflow-hidden rounded-md"
            >
              <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {photos?.length === 0 ? (
            <>
              <div className="text-center py-8 text-gray-500">
                {viewedUser?.id === user?.id ? (
                  <>
                    <h1 className="text-medium font-semibold">
                      You haven&apos;t uploaded any photos
                    </h1>
                    <p className="text-sm">
                      Start sharing your moments by uploading a photo.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-medium font-semibold">
                      No photos to show
                    </h1>
                    <p className="text-sm">
                      This user hasn&apos;t shared any public photos yet.
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <section className="flex flex-col md:gap-4 gap-2">
              <div className="flex flex-col">
                <h1 className="text-xl">Photos</h1>
                <p className="text-gray-700">
                  {viewedUser?.id === user?.id
                    ? "Your uploaded photos."
                    : "Photos shared by this user."}
                </p>
              </div>

              <PhotoProvider>
                <div className="grid grid-cols-4 md:gap-4 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative w-full pt-[100%] overflow-hidden rounded-md"
                      ref={index === photos.length - 1 ? lastPostRef : null}
                    >
                      <PhotoView src={photo.url}>
                        <Image
                          src={photo.url}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                          alt={`Photo ${photo.id}`}
                          fill
                          className="object-cover select-none cursor-pointer opacity-90 hover:opacity-100
                          ease-in-out duration-250 transition-opacity"
                        />
                      </PhotoView>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="relative w-full pt-[100%] overflow-hidden rounded-md"
                        >
                          <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PhotoProvider>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default PhotosTab;
