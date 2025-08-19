"use client";
import FriendSearchInput from "@/components/FriendSearchInput";
import FriendsListDetails from "@/components/FriendsListDetails";
import { useUserStore } from "@/store";
import React, { useState } from "react";

const FriendsTab: React.FC = () => {
  const { user, viewedUser, friends } = useUserStore();
  const [mode, setMode] = useState<"default" | "search">("default");

  return (
    <div
      className="bg-white rounded-lg w-full shadow p-4 flex flex-col md:gap-4 gap-3
    dark:bg-black dark:text-white dark:border dark:border-gray-700"
    >
      {mode === "default" ? (
        <>
          {friends?.length !== 0 && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col md:gap-1 text-medium">
                <h1 className="text-medium">
                  {viewedUser?.id === user?.id
                    ? "Your Friends"
                    : `${viewedUser?.profile.first_name + " " + viewedUser?.profile.last_name}'s Friends`}
                </h1>

                <p className="text-sm text-gray-500 dark:text-white/70">
                  {viewedUser?.id === user?.id
                    ? `You have ${user?.total_friends} friend${user?.total_friends !== 1 ? "s" : ""}`
                    : `${viewedUser?.profile.first_name + " " + viewedUser?.profile.last_name} 
            has ${viewedUser?.total_friends} friend${viewedUser?.total_friends !== 1 ? "s" : ""}`}
                </p>
              </div>

              <FriendSearchInput setMode={setMode} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex flex-col md:gap-1 text-medium">
              <h1 className="text-medium">
                {viewedUser?.id === user?.id
                  ? "Your Friends"
                  : `${viewedUser?.profile.first_name + " " + viewedUser?.profile.last_name}'s Friends`}
              </h1>

              <p className="text-sm text-gray-500 dark:text-white/70">
                {viewedUser?.id === user?.id
                  ? `You have ${user?.total_friends} friend${user?.total_friends !== 1 ? "s" : ""}`
                  : `${viewedUser?.profile.first_name + " " + viewedUser?.profile.last_name} 
            has ${viewedUser?.total_friends} friend${viewedUser?.total_friends !== 1 ? "s" : ""}`}
              </p>
            </div>

            <FriendSearchInput setMode={setMode} />
          </div>
        </>
      )}

      <FriendsListDetails mode={mode} />
    </div>
  );
};

export default FriendsTab;
