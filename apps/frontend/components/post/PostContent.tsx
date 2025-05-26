"use client";
import { PostDetails } from "@/store";
import Image from "next/image";
import React from "react";

interface PostContentProps {
  homePost: PostDetails;
}

const PostContent: React.FC<PostContentProps> = ({ homePost }) => {
  return (
    <section className="flex flex-col relative md:pb-2 pb-1">
      {(homePost?.contents?.length !== 0 ||
        homePost?.hashtags?.length !== 0) && (
        <section className="flex flex-col md:gap-2 gap-1 relative">
          {homePost?.contents?.length !== 0 && (
            <div className="flex flex-col relative md:gap-2 gap-1 text-black/80">
              {homePost.contents.map((ct) => (
                <p className="text-sm whitespace-pre-wrap" key={ct.id}>
                  {ct.content}
                </p>
              ))}
            </div>
          )}

          {homePost?.hashtags?.length !== 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {homePost.hashtags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs cursor-pointer text-blue-500 bg-blue-100 
                          px-2 py-0.5 rounded-full"
                >
                  #{tag.hashtag}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <div
        className={`grid gap-3 md:mt-3 mt-2 ${
          homePost.images.length === 1
            ? "grid-cols-1"
            : homePost.images.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        }`}
      >
        {homePost.images.map((image) => (
          <div
            key={image.id}
            className="relative w-full aspect-[4/3] overflow-hidden rounded-md"
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
        ))}
      </div>
    </section>
  );
};

export default PostContent;
