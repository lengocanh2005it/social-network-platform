"use client";
import GlobalIcon from "@/components/ui/icons/global";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  CircleX,
  Ellipsis,
  MessageSquareWarning,
  UserX,
  XIcon,
} from "lucide-react";
import React from "react";

interface PostHeaderProps {
  avatar: string;
  author: string;
  time: string;
  shouldHiddenXCloseIcon?: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  avatar,
  author,
  time,
  shouldHiddenXCloseIcon,
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center mb-3 gap-2">
        <Avatar
          src={avatar}
          alt={author}
          className="object-cover cursor-pointer select-none"
        />

        <div>
          <h4 className="font-semibold">{author}</h4>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">{time}</span>
            <GlobalIcon width={20} height={20} />
          </div>
        </div>
      </div>

      <div className="flex items-center md:gap-3 gap-2">
        <Dropdown
          placement="bottom-end"
          className="text-black"
          shouldBlockScroll={false}
        >
          <DropdownTrigger>
            <Ellipsis size={30} className="cursor-pointer focus:outline-none" />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem
              description="See fewer posts like this."
              key="hide-post"
              startContent={<CircleX />}
            >
              Hide post
            </DropdownItem>

            <DropdownItem
              description="We won't let Lana Nguyen know who reported this."
              key="report-post"
              startContent={<MessageSquareWarning />}
            >
              Report post
            </DropdownItem>

            <DropdownItem
              description="You won't be able to see or contact each other."
              key="block-user"
              startContent={<UserX />}
            >
              Block Lana Nguyen&apos;s profile
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {!shouldHiddenXCloseIcon && (
          <XIcon size={30} className="cursor-pointer" />
        )}
      </div>
    </div>
  );
};

export default PostHeader;
