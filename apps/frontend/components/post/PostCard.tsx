"use client";
import ViewPostModal from "@/components/modal/ViewPostModal";
import PostContent from "@/components/post/PostContent";
import PostHeader from "@/components/post/PostHeader";
import PostOptions from "@/components/post/PostOptions";
import { useState } from "react";

interface PostProps {
  author: string;
  content: string;
  time: string;
  avatar: string;
  image: string;
}

export default function PostCard({
  author,
  content,
  time,
  avatar,
  image,
}: PostProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-white border border-black/10 rounded-xl mb-6 p-4">
      <PostHeader avatar={avatar} author={author} time={time} />

      <PostContent content={content} image={image} />

      <PostOptions setIsOpen={setIsOpen} />

      {isOpen && (
        <ViewPostModal
          author={author}
          content={content}
          time={time}
          avatar={avatar}
          image={image}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </div>
  );
}
