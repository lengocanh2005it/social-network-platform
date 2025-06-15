"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import CreatePost from "@/components/post/CreatePost";
import PostCard from "@/components/post/PostCard";
import StorySlider from "@/components/sliders/StoriesSlider";
import { useGetPosts, useInfiniteScroll } from "@/hooks";
import { getHomePosts } from "@/lib/api/posts";
import { usePostStore } from "@/store";
import { ScrollShadow, Spinner } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

const FeedPage = () => {
  const { data, isLoading } = useGetPosts();
  const { homePosts, setHomePosts, appendOldHomePosts } = usePostStore();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    if (data && data?.data) setHomePosts(data?.data, data?.nextCursor);
    setNextCursor(data?.nextCursor ? data.nextCursor : null);
  }, [data, setHomePosts, setNextCursor]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getHomePosts({ after: nextCursor });

      if (res?.data) {
        appendOldHomePosts(res.data);
        setNextCursor(res.nextCursor ?? null);
      }
    } finally {
      setHasMore(false);
    }
  }, [nextCursor, hasMore, appendOldHomePosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <ScrollShadow
      className="flex flex-col md:gap-3 gap-2 relative"
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
              {homePosts.map((post, index) => (
                <div
                  key={post.id}
                  ref={index === homePosts.length - 1 ? lastPostRef : null}
                >
                  <PostCard homePost={post} />
                </div>
              ))}

              {hasMore && <PrimaryLoading />}
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
