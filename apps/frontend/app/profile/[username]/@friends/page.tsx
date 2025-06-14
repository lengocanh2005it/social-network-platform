"use client";
import FriendsList from "@/components/FriendsList";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetFriendsList } from "@/hooks";
import { useFriendStore, useUserStore } from "@/store";
import Link from "next/link";
import React, { useEffect } from "react";

const ProfileFriendSection: React.FC = () => {
  const { viewedUser, user } = useUserStore();
  const { friends, totalFriends, setFriends, setTotalFriends } =
    useFriendStore();
  const isCurrentUser = viewedUser?.id == user?.id;
  const { data, isLoading } = useGetFriendsList(
    isCurrentUser ? (user?.id ?? "") : (viewedUser?.id ?? ""),
    {
      username: isCurrentUser
        ? (user?.profile?.username ?? "")
        : (viewedUser?.profile?.username ?? ""),
    },
  );

  useEffect(() => {
    if (data?.data) setFriends(data.data);
    if (data?.total_friends) setTotalFriends(data.total_friends);
  }, [data, setFriends, setTotalFriends]);

  return (
    <section className="w-full flex flex-col md:gap-2 gap-1">
      <div className="flex items-center justify-between">
        <h1 className="font-medium md:text-xl text-lg">Friends</h1>

        {totalFriends >= 2 && (
          <Link
            href={`/profile/${
              viewedUser?.id !== user?.id
                ? (viewedUser?.profile.username ?? "")
                : (user?.profile.username ?? "")
            }/?tab=friends`}
            className="text-blue-700 hover:underline"
          >
            See all friends
          </Link>
        )}
      </div>

      {totalFriends > 0 && (
        <p>
          {totalFriends} friend{totalFriends > 1 && "s"}
        </p>
      )}

      {isLoading ? (
        <PrimaryLoading />
      ) : (
        <>
          {friends?.length > 0 ? (
            <FriendsList friends={friends} />
          ) : (
            <div className="text-center py-6 px-4 flex flex-col md:gap-2 gap-1">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                Your friends list is empty
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Start connecting with others so you don&apos;t miss any fun
                conversations.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ProfileFriendSection;
