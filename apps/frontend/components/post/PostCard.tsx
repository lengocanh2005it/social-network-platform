"use client";
import ViewPostModal from "@/components/modal/ViewPostModal";
import PostContent from "@/components/post/PostContent";
import PostHeader from "@/components/post/PostHeader";
import PostOptions from "@/components/post/PostOptions";
import { Post } from "@/utils";
import { useState } from "react";

export default function PostCard({ homePost }: { homePost: Post }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-white border border-black/10 rounded-xl mb-6 p-4">
      <PostHeader homePost={homePost} />

      <PostContent homePost={homePost} />

      <PostOptions setIsOpen={setIsOpen} />

      {isOpen && (
        <ViewPostModal
          homePost={homePost}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </div>
  );
}
