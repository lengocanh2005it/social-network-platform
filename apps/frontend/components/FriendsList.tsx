import { FriendType } from "@/utils";
import Image from "next/image";
import React from "react";

interface FriendsListProps {
  friends: FriendType[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  const MAX_DISPLAY = 9;
  const displayFriendsList = friends.slice(0, MAX_DISPLAY);

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 mt-2">
      {displayFriendsList.map((fl) => (
        <div key={fl.id} className="flex flex-col md:gap-2 gap-1">
          <div className="relative w-full pt-[100%] overflow-hidden rounded-md">
            <Image
              src={fl.avatar}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              alt={fl.name}
              fill
              className="object-cover select-none cursor-pointer"
            />
          </div>

          <p className="w-full break-all text-sm whitespace-pre-wrap hover:underline hover:cursor-pointer">
            {fl.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
