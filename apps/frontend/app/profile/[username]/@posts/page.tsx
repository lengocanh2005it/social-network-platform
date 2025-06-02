"use client";
import CreatePost from "@/components/post/CreatePost";
import ProfilePosts from "@/components/post/ProfilePosts";
import { useGetFeed, useInfiniteScroll } from "@/hooks";
import { getMyFeed } from "@/lib/api/users";
import { usePostStore, useUserStore } from "@/store";
import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

const ProfilePostsSection = () => {
  const { posts, appendOldPosts, setPosts, nextCursor } = usePostStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { viewedUser, user } = useUserStore();
  const { data, isLoading: isLoadingFeed } = useGetFeed(
    viewedUser?.profile?.username ?? "",
  );

  useEffect(() => {
    if (data && data?.data) {
      setPosts(data?.data, data?.nextCursor);
    }
  }, [data, setPosts]);

  const loadMore = async () => {
    if (!nextCursor || isLoading || !viewedUser?.profile) return;

    setIsLoading(true);

    try {
      const res = await getMyFeed(viewedUser?.profile.username, {
        after: nextCursor,
      });

      if (res && res?.data) {
        appendOldPosts(res?.data, res?.nextCursor);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <section className="flex flex-col md:gap-4 gap-3">
      {viewedUser?.id === user?.id && <CreatePost />}

      {posts?.length !== 0 ? (
        <div className="flex flex-col relative">
          {posts.map((p, index) => (
            <div
              key={p.id}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <ProfilePosts post={p} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {!(isLoading || isLoadingFeed) && (
            <div
              className={`flex flex-col items-center justify-center text-center md:gap-2 
    gap-1 ${viewedUser?.id !== user?.id && "md:mt-16 mt-8"}`}
            >
              {viewedUser?.id !== user?.id ? (
                <>
                  <h1 className="text-center text-gray-600">
                    Nothing here yet.
                  </h1>

                  <p className="text-center text-sm text-gray-500">
                    {viewedUser?.profile?.first_name +
                      " " +
                      viewedUser?.profile?.last_name || "This user"}{" "}
                    hasn&apos;t posted anything yet.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-center text-gray-600">
                    Let&apos;s get started!
                  </h1>

                  <p className="text-center text-sm text-gray-500">
                    You haven&apos;t posted anything yet. Share something with
                    the world.
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {(isLoading || isLoadingFeed) && (
        <div
          className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
            flex-col items-center justify-center text-center"
        >
          <Spinner />

          <p>Loading...</p>
        </div>
      )}
    </section>
  );
};

export default ProfilePostsSection;
