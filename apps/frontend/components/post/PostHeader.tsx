"use client";
import GlobalIcon from "@/components/ui/icons/global";
import UndoPostToast from "@/components/UndoPostToast";
import { PostDetails, usePostStore, useUserStore } from "@/store";
import { formatDateTime, HIDE_DURATION } from "@/utils";
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
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

interface PostHeaderProps {
  homePost: PostDetails;
  shouldHiddenXCloseIcon?: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  homePost,
  shouldHiddenXCloseIcon,
}) => {
  const { hideHomePosts, homePosts, restoreHomePostAtIndex } = usePostStore();
  const { user } = useUserStore();
  const router = useRouter();

  const viewProfileClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handleHidePost = (postId: string) => {
    const index = homePosts.findIndex((p) => p.id === postId);

    const post = homePosts[index];

    if (index === -1 || !post) return;

    hideHomePosts(postId);

    let toastId: string = "";

    const intervalId: NodeJS.Timeout = setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        clearInterval(intervalId);
        return;
      }

      toast.custom(
        () => <UndoPostToast onUndo={undo} remaining={remaining} />,
        { id: toastId, duration: HIDE_DURATION },
      );
    }, 1000);

    let remaining = HIDE_DURATION / 1000;

    const undo = () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      toast.dismiss(toastId);
      restoreHomePostAtIndex(post, index);
    };

    const timeoutId = setTimeout(() => {
      toast.dismiss(toastId);
    }, HIDE_DURATION);

    toastId = toast.custom(
      () => <UndoPostToast onUndo={undo} remaining={remaining} />,
      {
        duration: HIDE_DURATION + 500,
        position: "bottom-right",
      },
    );
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center mb-3 gap-2">
        <Avatar
          src={homePost.user.profile.avatar_url}
          alt={
            homePost.user.profile.first_name +
            " " +
            homePost.user.profile.last_name
          }
          className="object-cover cursor-pointer select-none"
          onClick={() => viewProfileClick(homePost.user.profile.username)}
        />

        <div className="flex flex-col relative">
          <h4
            className="font-semibold cursor-pointer hover:underline"
            onClick={() => viewProfileClick(homePost.user.profile.username)}
          >
            {homePost.user.profile.first_name +
              " " +
              homePost.user.profile.last_name}
          </h4>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">
              {formatDateTime(homePost.created_at)}
            </span>
            <GlobalIcon width={20} height={20} />
          </div>
        </div>
      </div>

      {user?.id !== homePost.user.id && (
        <div className="flex items-center md:gap-3 gap-2">
          <Dropdown
            placement="bottom-end"
            className="text-black"
            shouldBlockScroll={false}
          >
            <DropdownTrigger>
              <Ellipsis
                size={30}
                className="cursor-pointer focus:outline-none"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Post Actions" variant="flat">
              <DropdownItem
                description="See fewer posts like this."
                key="hide-post"
                startContent={<CircleX />}
                onClick={() => handleHidePost(homePost.id)}
              >
                Hide post
              </DropdownItem>

              <DropdownItem
                description={`We won't let ${
                  homePost.user.profile.first_name +
                  " " +
                  homePost.user.profile.last_name
                } 
              know who reported this.`}
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
                Block{" "}
                {homePost.user.profile.first_name +
                  " " +
                  homePost.user.profile.last_name}
                &apos;s profile
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {!shouldHiddenXCloseIcon && (
            <XIcon
              size={30}
              className="cursor-pointer"
              onClick={() => handleHidePost(homePost.id)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;
