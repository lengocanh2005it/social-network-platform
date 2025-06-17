"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useBlockUser, useDeleteFriendRequest } from "@/hooks";
import { useFriendStore, useUserStore } from "@/store";
import { BlockUserType, Friend, RelationshipType } from "@/utils";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  Ellipsis,
  SearchSlash,
  UserLock,
  UserRoundX,
  Users,
} from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

interface FriendCardListProps {
  friends: Friend[];
  lastFriendRef: (node: HTMLDivElement | null) => void;
  hasMore: boolean;
  isSearching?: boolean;
  setIsSearching?: (isSearching: boolean) => void;
}

const FriendCardList: React.FC<FriendCardListProps> = ({
  friends,
  lastFriendRef,
  hasMore,
  isSearching,
  setIsSearching,
}) => {
  const { updateFriendById, removeFriendById } = useUserStore();
  const { removeFriend } = useFriendStore();
  const { mutate: mutateDeleteFriendRequest } = useDeleteFriendRequest();
  const { mutate: mutateBlockUser } = useBlockUser();

  const handleDeleteFriend = (friend: Friend) => {
    mutateDeleteFriendRequest(friend.user_id, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success(`You're no longer friends with ${friend.full_name}.`, {
            position: "bottom-right",
          });
          updateFriendById(friend.user_id, {
            is_friend: false,
          });
          removeFriendById(friend.user_id);
          removeFriend(friend.user_id);
          if (setIsSearching) setIsSearching(false);
        }
      },
    });
  };

  const blockUserClick = (friend: Friend) => {
    const blockUserData: BlockUserType = {
      targetId: friend.user_id,
    };

    mutateBlockUser(blockUserData, {
      onSuccess: (data: Record<string, string | boolean>) => {
        if (data) {
          toast.success(`Successfully blocked user ${friend.full_name}.`, {
            position: "bottom-right",
          });
          updateFriendById(friend.user_id, {
            is_friend: false,
          });
          removeFriendById(friend.user_id);
          removeFriend(friend.user_id);
          if (setIsSearching) setIsSearching(false);
        }
      },
    });
  };

  if (friends.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4 flex flex-col items-center gap-2">
        {isSearching ? (
          <>
            <SearchSlash className="w-12 h-12 text-gray-400" />
            <p className="text-lg font-semibold">No matching friends found</p>
            <p className="text-sm">
              Try searching with a different name or check your spelling.
            </p>
          </>
        ) : (
          <>
            <Users className="w-12 h-12 text-gray-400" />
            <p className="text-lg font-semibold">No friends yet</p>
            <p className="text-sm">
              Start connecting with people to see them here.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:gap-1">
      {friends.map((friend, index) => (
        <div
          key={friend.user_id}
          ref={index === friends.length - 1 ? lastFriendRef : null}
          className="flex items-center md:gap-2 gap-1 p-3 rounded-md hover:bg-gray-100 cursor-pointer"
        >
          <Avatar
            src={friend.avatar_url}
            alt={friend.full_name}
            className="w-12 h-12 select-none rounded-full flex-shrink-0"
          />
          <div className="flex items-center justify-between flex-1">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{friend.full_name}</span>
              <span className="text-xs text-gray-500">
                @{friend.username}{" "}
                {friend.mutual_friends > 0 &&
                  `- ${friend.mutual_friends} mutual friends`}
              </span>
            </div>

            <Dropdown
              placement="bottom-end"
              className="text-black"
              shouldBlockScroll={false}
            >
              <DropdownTrigger>
                <Ellipsis
                  size={25}
                  className="cursor-pointer focus:outline-none"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Friend Actions" variant="flat">
                <DropdownItem
                  key="unfriend"
                  startContent={<UserRoundX />}
                  onClick={() => handleDeleteFriend(friend)}
                >
                  Unfriend
                </DropdownItem>
                <DropdownItem
                  key="block"
                  startContent={<UserLock />}
                  onClick={() => blockUserClick(friend)}
                >
                  Block
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      ))}
      {hasMore && <PrimaryLoading />}
    </div>
  );
};

export default FriendCardList;
