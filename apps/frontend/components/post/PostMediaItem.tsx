"use client";
import ViewPostMediaDetailsModal from "@/components/modal/ViewPostMediaDetailsModal";
import { PostDetails } from "@/store";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import React, { useState } from "react";

interface PostMediaItemProps {
  images: {
    id: string;
    image_url: string;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  }[];
  post: PostDetails;
  shouldHideAction?: boolean;
}

const PostMediaItem: React.FC<PostMediaItemProps> = ({
  images,
  post,
  shouldHideAction,
}) => {
  const [isShowMediaDetails, setIsShowMediaDetails] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<(typeof images)[0] | null>(
    null,
  );

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    mode: "snap",
    slides: {
      perView: images.length > 1 ? 2 : 1,
      spacing: 10,
    },
  });

  const handleImageClick = (image: (typeof images)[0]) => {
    setSelectedImage(image);
    setIsShowMediaDetails(true);
  };

  return (
    <>
      <div ref={sliderRef} className="keen-slider rounded-md overflow-hidden">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="keen-slider__slide relative aspect-[4/3] cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <Image
              src={image.image_url}
              alt={`Image ${index + 1}`}
              fill
              className="select-none rounded-md"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        ))}
      </div>

      {isShowMediaDetails && selectedImage && (
        <ViewPostMediaDetailsModal
          mediaUrl={selectedImage.image_url}
          type="image"
          isOpen={isShowMediaDetails}
          setIsOpen={setIsShowMediaDetails}
          post={post}
          mediaId={selectedImage.id}
          shouldHideAction={shouldHideAction}
        />
      )}
    </>
  );
};

export default PostMediaItem;
