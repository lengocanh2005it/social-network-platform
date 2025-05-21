"use client";
import CreatePost from "@/components/post/CreatePost";
import PostCard from "@/components/post/PostCard";
import StorySlider from "@/components/sliders/StoriesSlider";
import { useGetPosts } from "@/hooks";
import { usePostStore } from "@/store";
import { ScrollShadow, Spinner } from "@heroui/react";
import { useEffect } from "react";

const FeedPage = () => {
  const { data, isLoading, isError } = useGetPosts();
  const { homePosts, setHomePosts } = usePostStore();

  useEffect(() => {
    if (data && data?.data) setHomePosts(data?.data, data?.nextCursor);
  }, [data, setHomePosts]);

  if (isLoading)
    return (
      <div
        className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
        flex-col items-center justify-center text-center"
      >
        <Spinner />

        <p>Loading...</p>
      </div>
    );

  if (isError) return <div>Error...</div>;

  return (
    <ScrollShadow
      className="h-screen flex flex-col md:gap-3 gap-2 pr-2"
      hideScrollBar
      offset={0}
      size={0}
    >
      <CreatePost />

      <StorySlider />

      {homePosts?.length !== 0 ? (
        <>
          <section className="flex flex-col md:gap-2 gap-1">
            {homePosts.map((post) => (
              <PostCard key={post.id} homePost={post} />
            ))}
          </section>
        </>
      ) : (
        <>
          {!isLoading && (
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
