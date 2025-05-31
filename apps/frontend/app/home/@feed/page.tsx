"use client";
import CreatePost from "@/components/post/CreatePost";
import PostCard from "@/components/post/PostCard";
import StorySlider from "@/components/sliders/StoriesSlider";
import { useGetPosts } from "@/hooks";
import { usePostStore } from "@/store";
import { ScrollShadow, Spinner } from "@heroui/react";
import { useEffect } from "react";

const FeedPage = () => {
  const { data, isLoading } = useGetPosts();
  const { homePosts, setHomePosts } = usePostStore();

  useEffect(() => {
    if (data && data?.data) setHomePosts(data?.data, data?.nextCursor);
  }, [data, setHomePosts]);

  return (
    <ScrollShadow
      className="h-screen flex flex-col md:gap-3 gap-2 pr-2"
      hideScrollBar
      offset={0}
      size={0}
    >
      <CreatePost />

      <StorySlider />

      {isLoading ? (
        <div
          className="w-full flex md:gap-3 gap-2 
        flex-col items-center justify-center text-center md:mt-8 mt-4"
        >
          <Spinner />

          <p>Loading...</p>
        </div>
      ) : (
        <>
          {homePosts?.length !== 0 ? (
            <section className="flex flex-col md:gap-2 gap-1">
              {homePosts.map((post) => (
                <PostCard key={post.id} homePost={post} />
              ))}
            </section>
          ) : (
            <div
              className="flex flex-col items-center justify-center text-center md:gap-2 gap-1
            md:mt-6 mt-4"
            >
              <h1 className="text-center text-gray-600">No Activity Yet</h1>

              <p className="text-center text-sm text-gray-500">
                Your friend hasn&apos;t posted anything yet.
              </p>
            </div>
          )}
        </>
      )}
    </ScrollShadow>
  );
};

export default FeedPage;
