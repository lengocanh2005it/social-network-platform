"use client";
import PostStats from "@/components/post/PostStats";
import Image from "next/image";
import React from "react";

interface PostContentProps {
  content: string;
  image?: string;
}

const PostContent: React.FC<PostContentProps> = ({ content, image }) => {
  return (
    <>
      <p className="mb-3">{content}</p>

      {image && (
        <div className="relative w-full min-h-[400px] max-h-[600px]">
          <Image
            src={image}
            alt="post"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-md mb-3 select-none"
          />
        </div>
      )}

      <PostStats />
    </>
  );
};

export default PostContent;
