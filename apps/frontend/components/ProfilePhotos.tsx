"use client";
import StoryModal from "@/components/modal/StoryModal";
import ViewPostMediaDetailsOverlay from "@/components/modal/ViewPostMediaDetailsModal";
import { getPostOfUser } from "@/lib/api/posts";
import { getStory } from "@/lib/api/stories";
import { PostDetails, useUserStore } from "@/store";
import { Photo, Story } from "@/utils";
import { Skeleton } from "@heroui/skeleton";
import { PhotoTypeEnum } from "@repo/db";
import Image from "next/image";
import React, { useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface ProfilePhotosProps {
  photos: Photo[];
  nextCursor: string | null;
  isLoading: boolean;
}

const ProfilePhotos: React.FC<ProfilePhotosProps> = ({ photos, isLoading }) => {
  const { viewedUser, user } = useUserStore();
  const MAX_DISPLAY = 9;
  const hasMore = photos.length > MAX_DISPLAY;
  const displayPhotos = photos.slice(0, MAX_DISPLAY);
  const [isShowMediaDetails, setIsShowMediaDetails] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [post, setPost] = useState<PostDetails | null>(null);
  const [story, setStory] = useState<Story | null>(null);

  const handleSelectPhoto = async (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsShowMediaDetails(true);

    if (
      photo?.metadata?.post_id &&
      (photo?.metadata?.post_image_id || photo?.metadata?.post_video_id)
    ) {
      const res = await getPostOfUser(
        viewedUser?.profile?.username ?? "",
        photo?.metadata.post_id
      );

      if (res) setPost(res);
    }

    if (photo?.metadata?.story_id) {
      const res = await getStory(photo?.metadata?.story_id);

      if (res) setStory(res);
    }
  };

  return (
    <>
      <div className="relative">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="relative w-full pt-[100%] overflow-hidden rounded-md"
              >
                <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : photos.length !== 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {displayPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative w-full pt-[100%] overflow-hidden rounded-md"
              >
                {photo.type === PhotoTypeEnum.POST ||
                photo.type === PhotoTypeEnum.STORY ? (
                  <>
                    <Image
                      src={photo.url}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      alt={`Photo ${photo.id}`}
                      fill
                      className="object-cover select-none cursor-pointer opacity-90 hover:opacity-100
              ease-in-out duration-250 transition-opacity"
                      onClick={() => handleSelectPhoto(photo)}
                    />
                  </>
                ) : (
                  <>
                    <PhotoProvider>
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
                    </PhotoProvider>
                  </>
                )}

                {hasMore && index === MAX_DISPLAY - 1 && (
                  <div
                    className="absolute select-none inset-0 bg-black/40 flex items-center 
                justify-center cursor-pointer"
                  >
                    <span className="text-white text-lg font-semibold">
                      +{photos.length - MAX_DISPLAY}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
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
                <h1 className="text-medium font-semibold">No photos to show</h1>
                <p className="text-sm">
                  This user hasn&apos;t shared any public photos yet.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {isShowMediaDetails && selectedPhoto && post && (
        <ViewPostMediaDetailsOverlay
          isOpen={isShowMediaDetails}
          setIsOpen={setIsShowMediaDetails}
          type={selectedPhoto?.metadata?.post_image_id ? "image" : "video"}
          mediaUrl={selectedPhoto.url}
          mediaId={
            selectedPhoto.metadata?.post_image_id
              ? selectedPhoto?.metadata?.post_image_id
              : selectedPhoto?.metadata?.post_video_id
          }
          post={post}
        />
      )}

      {isShowMediaDetails && selectedPhoto && story && (
        <StoryModal
          story={story}
          onClose={() => {
            setStory(null);
            setIsShowMediaDetails(false);
          }}
        />
      )}
    </>
  );
};

export default ProfilePhotos;
