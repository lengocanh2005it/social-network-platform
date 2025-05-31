"use client";
import FriendDetails from "@/components/FriendDetails";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetFriendsList } from "@/hooks";
import { getFriendsList } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { handleAxiosError } from "@/utils";
import React, { useEffect, useState } from "react";

interface FriendsListDetailsProps {
  mode: "default" | "search";
}

const FriendsListDetails: React.FC<FriendsListDetailsProps> = ({ mode }) => {
  const { user, viewedUser, friends, setFriends, addOldFriends } =
    useUserStore();
  const { data, isLoading } = useGetFriendsList(
    viewedUser?.id !== user?.id ? (viewedUser?.id ?? "") : (user?.id ?? ""),
    {
      username:
        viewedUser?.id !== user?.id
          ? (viewedUser?.profile.username ?? "")
          : (user?.profile.username ?? ""),
    },
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      if (data?.data) {
        setFriends(data?.data);
      }
      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    }
  }, [data, setNextCursor, setFriends]);

  if (isLoading) return <PrimaryLoading />;

  const handleLoadMore = async () => {
    if (!nextCursor) return;

    setLoadMore(true);

    try {
      const res = await getFriendsList({
        after: nextCursor,
        username:
          viewedUser?.id !== user?.id
            ? (viewedUser?.profile.username ?? "")
            : (user?.profile.username ?? ""),
      });

      if (res?.data) addOldFriends(res.data);

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setLoadMore(false);
    }
  };

  return (
    <>
      {friends?.length > 0 ? (
        <section className="flex flex-col md:gap-3 gap-2">
          <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-2">
            {friends.map((friend) => (
              <FriendDetails friend={friend} key={friend.user_id} />
            ))}
          </div>

          {loadMore && <PrimaryLoading />}

          {nextCursor && (
            <p
              className="text-right hover:underline hover:text-blue-500 transition-all
          ease-in-out cursor-pointer"
              onClick={handleLoadMore}
            >
              Load more friends
            </p>
          )}
        </section>
      ) : (
        <>
          {mode === "default" ? (
            <>
              {viewedUser?.id === user?.id ? (
                <div className="text-center py-6">
                  <h1 className="text-xl font-semibold text-gray-800">
                    You don&apos;t have any friends yet
                  </h1>
                  <p className="text-gray-600">
                    Start connecting with others to make new friends!
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <h1 className="text-xl font-semibold text-gray-800">
                    {viewedUser?.profile.first_name +
                      " " +
                      viewedUser?.profile.last_name || "This user"}{" "}
                    doesn&apos;t have any friends yet
                  </h1>
                  <p className="text-gray-600">
                    Once they connect with others, their friends will show up
                    here.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <h1 className="text-xl font-semibold text-gray-800">
                No matching friends found
              </h1>
              <p className="text-gray-600">
                Try searching with a different name or check your spelling.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default FriendsListDetails;
