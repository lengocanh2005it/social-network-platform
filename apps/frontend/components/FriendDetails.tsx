"use client";
import { useBlockUser, useDeleteFriendRequest } from "@/hooks";
import { useUserStore } from "@/store";
import { BlockUserType, Friend, RelationshipType } from "@/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

interface FriendDetailsProps {
  friend: Friend;
}

const FriendDetails: React.FC<FriendDetailsProps> = ({ friend }) => {
  const {
    user,
    setUser,
    viewedUser,
    updateFriendById,
    removeFriendById,
    setViewedUser,
  } = useUserStore();
  const router = useRouter();
  const { mutate: mutateDeleteFriendRequest } = useDeleteFriendRequest();
  const { mutate: mutateBlockUser } = useBlockUser();

  const blockUserClick = () => {
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

          if (user && viewedUser) {
            if (viewedUser?.id === user?.id) {
              setUser({
                ...user,
                total_friends: user?.total_friends - 1,
              });
            } else {
              setViewedUser({
                ...viewedUser,
                total_friends: viewedUser.total_friends - 1,
              });
            }
          }
        }
      },
    });
  };

  const handleViewProfile = () => {
    router.push(`/profile/${friend.username}`);
  };

  const handleDeleteFriend = () => {
    mutateDeleteFriendRequest(friend.user_id, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success(`You're no longer friends with ${friend.full_name}.`, {
            position: "bottom-right",
          });

          updateFriendById(friend.user_id, {
            is_friend: false,
          });

          if (user && viewedUser) {
            if (viewedUser?.id === user?.id) {
              setUser({
                ...user,
                total_friends: user?.total_friends - 1,
              });

              removeFriendById(friend.user_id);
            }
          }
        }
      },
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 flex items-center justify-between
    dark:bg-black dark:text-white dark:border dark:border-gray-700"
    >
      <div className="flex md:gap-3 gap-2 items-center">
        <div
          className="w-[100px] h-[100px] relative cursor-pointer opacity-90 hover:opacity-100
        duration-300 ease-in-out transition-all select-none"
        >
          <Image
            src={friend.avatar_url}
            alt={friend.full_name}
            fill
            priority
            className="rounded-medium"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div className="flex flex-col relative">
            <h2
              className="cursor-pointer hover:underline"
              onClick={handleViewProfile}
            >
              {friend.full_name} {user?.id === friend.user_id && `(You)`}
            </h2>

            <Tooltip content="Username" delay={4000}>
              <p className="text-sm text-black/70 dark:text-white/70">
                @{friend.username}
              </p>
            </Tooltip>
          </div>

          {friend?.mutual_friends > 0 && user?.id !== friend.user_id && (
            <p className="text-gray-500">
              {friend.mutual_friends} mututal friend
              {friend.mutual_friends > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {user?.id !== friend.user_id && (
        <Dropdown
          placement="bottom-end"
          className="text-black dark:text-white"
          shouldBlockScroll={false}
        >
          <DropdownTrigger>
            <Ellipsis size={30} className="cursor-pointer focus:outline-none" />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="view-profile" onClick={handleViewProfile}>
              View profile
            </DropdownItem>
            {friend.is_friend === true ? (
              <DropdownItem key="unfriend" onClick={handleDeleteFriend}>
                Unfriend
              </DropdownItem>
            ) : null}
            <DropdownItem key="block-friend" onClick={blockUserClick}>
              Block
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
};

export default FriendDetails;
