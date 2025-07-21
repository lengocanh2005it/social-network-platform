"use client";
import { Friend, MAX_DISPLAY_FRIEND_LISTS } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

interface FriendsListProps {
  friends: Friend[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  const router = useRouter();
  const displayFriendsList = friends.slice(0, MAX_DISPLAY_FRIEND_LISTS);

  const handleSeeProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-3 mt-2">
      {displayFriendsList.map((fl) => (
        <div
          key={fl.user_id}
          className="flex flex-col md:gap-2 gap-1 p-2 rounded-lg shadow-sm hover:bg-gray-100 
          text-center dark:bg-white/20 dark:hover:bg-white/40"
        >
          <div className="relative w-full pt-[100%] overflow-hidden rounded-md">
            <Image
              src={fl.avatar_url}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              alt={fl.full_name}
              fill
              className="object-cover select-none cursor-pointer flex-shrink-0"
            />
          </div>

          <p
            className="w-full break-all text-sm whitespace-pre-wrap hover:underline 
          hover:cursor-pointer"
            onClick={() => handleSeeProfile(fl.username)}
          >
            {fl.full_name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
