"use client";
import React from "react";
import { ScrollShadow } from "@heroui/react";
import PostCard from "@/components/post/PostCard";
import CreatePost from "@/components/post/CreatePost";
import StorySlider from "@/components/sliders/StoriesSlider";

const posts = [
  {
    id: 1,
    author: "Lana Nguyen",
    content: "The weather is beautiful today! ☀️",
    time: "2 hours ago",
    avatar: "https://i.pravatar.cc/40?u=lan",
    image:
      "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    id: 2,
    author: "Mike Tran",
    content: "Just had some pho, it was amazing 😋",
    time: "4 hours ago",
    avatar: "https://i.pravatar.cc/40?u=minh",
    image:
      "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    id: 3,
    author: "Harry Do",
    content: "Anyone up for coffee this afternoon? ☕️",
    time: "1 day ago",
    avatar: "https://i.pravatar.cc/40?u=hai",
    image:
      "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
];

const FeedPage = () => {
  return (
    <ScrollShadow
      className="h-screen flex flex-col md:gap-3 gap-2 pr-2"
      hideScrollBar
      offset={0}
      size={0}
    >
      <CreatePost />

      <StorySlider />

      <section className="flex flex-col md:gap-2 gap-1">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </section>
    </ScrollShadow>
  );
};

export default FeedPage;
