"use client";
import ViewPostMediaDetailsModal from "@/components/modal/ViewPostMediaDetailsModal";
import { PostDetails } from "@/store";
import Image from "next/image";
import React, { useState } from "react";

interface PostMediaItemsProps {
  image: {
    id: string;
    image_url: string;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  };
  post: PostDetails;
}

const PostMediaItem: React.FC<PostMediaItemsProps> = ({ image, post }) => {
  const [isShowMediaDetails, setIsShowMediaDetails] = useState<boolean>(false);

  return (
    <>
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-md cursor-pointer"
        onClick={() => setIsShowMediaDetails(true)}
      >
        <Image
          src={image.image_url}
          alt="post"
          fill
          priority
          sizes="100vw"
          className="select-none"
        />
      </div>

      {isShowMediaDetails && (
        <ViewPostMediaDetailsModal
          mediaUrl={image.image_url}
          type="image"
          isOpen={isShowMediaDetails}
          setIsOpen={setIsShowMediaDetails}
          post={post}
          mediaId={image.id}
        />
      )}
    </>
  );
};

export default PostMediaItem;
