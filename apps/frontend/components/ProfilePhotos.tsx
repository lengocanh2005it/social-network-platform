"use client";
import Image from "next/image";
import React from "react";

interface ProfilePhotosProps {
  images: string[];
}

const ProfilePhotos: React.FC<ProfilePhotosProps> = ({ images }) => {
  const MAX_DISPLAY = 9;
  const hasMore = images.length > MAX_DISPLAY;
  const displayImages = images.slice(0, MAX_DISPLAY);

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 mt-2">
      {displayImages.map((image, index) => (
        <div
          key={index}
          className="relative w-full pt-[100%] overflow-hidden rounded-md"
        >
          <Image
            src={image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            alt={`Photo ${index + 1}`}
            fill
            className="object-cover select-none cursor-pointer opacity-90 hover:opacity-100
            ease-in-out duration-250 transition-opacity"
          />

          {hasMore && index === MAX_DISPLAY - 1 && (
            <div
              className="absolute select-none inset-0 bg-black/40 bg-opacity-50 
            flex items-center justify-center cursor-pointer"
            >
              <span className="text-white text-lg font-semibold">
                +{images.length - MAX_DISPLAY}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfilePhotos;
