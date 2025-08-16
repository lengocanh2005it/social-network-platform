"use client";
import ConfirmDeletePostModal from "@/components/modal/ConfirmDeletePostModal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import ViewLikedUsersDetaiModal from "@/components/modal/ViewLikedUsersDetaiModal";
import ViewUserCommentsModal from "@/components/modal/ViewUserCommentsModal";
import ViewUserSharesModal from "@/components/modal/ViewUserSharesModal";
import PostMediaItem from "@/components/post/PostMediaItem";
import { TaggedUsersText } from "@/components/TaggedUsersText";
import { Button } from "@/components/ui/button";
import { useUpdatePostStatus } from "@/hooks/useUpdatePostStatus";
import { PostDetails } from "@/store";
import { UpdatePostStatusData } from "@/utils";
import { Avatar, Divider, Tooltip } from "@heroui/react";
import { PostPrivaciesEnum } from "@repo/db";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Globe,
  Heart,
  Lock,
  LockOpen,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface PostCardProps {
  post: PostDetails;
  setPosts: React.Dispatch<React.SetStateAction<PostDetails[]>>;
}

const PostCard: React.FC<PostCardProps> = ({ post, setPosts }) => {
  const [isViewedLikedUserModal, setIsViewedLikedUserModal] =
    useState<boolean>(false);
  const user = post.user;
  const fullName = `${user.profile.first_name} ${user.profile.last_name}`;
  const postedTime = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });
  const { mutate: mutateUpdatePostStatus, isPending } = useUpdatePostStatus();
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);

  const onConfirm = () => {
    mutateUpdatePostStatus(
      {
        postId: post.id,
        updatePostStatusDto: {
          is_active: true,
        },
      },
      {
        onSuccess,
      },
    );
  };

  const onDelete = (reason: string) =>
    mutateUpdatePostStatus(
      {
        postId: post.id,
        updatePostStatusDto: {
          reason,
          is_active: false,
        },
      },
      {
        onSuccess,
      },
    );

  const onSuccess = (
    data: Record<string, string | number>,
    variables: UpdatePostStatusData,
  ) => {
    if (data?.success && typeof data?.message === "string") {
      setPosts((prev) =>
        prev.map((originalPost) => {
          if (originalPost.id === post.id) {
            return {
              ...originalPost,
              deleted_at: variables.updatePostStatusDto.is_active
                ? null
                : new Date().toLocaleString(),
            };
          }

          if (originalPost.parent_post_id === post.id) {
            if (!variables.updatePostStatusDto.is_active) {
              return {
                ...originalPost,
                parent_post: undefined,
              };
            } else {
              return {
                ...originalPost,
                parent_post: {
                  ...post,
                  deleted_at: null,
                },
              };
            }
          }

          return originalPost;
        }),
      );

      setIsModalConfirmOpen(false);
      toast.success(data.message, {
        position: "bottom-right",
      });
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 
    dark:border-gray-800 transition hover:shadow-md overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={user.profile.avatar_url}
            alt={fullName}
            className="w-10 h-10 rounded-full flex-shrink-0 select-none cursor-pointer"
          />

          <div className="relative">
            <div className="flex items-center gap-1">
              <Tooltip
                content={user.email}
                placement="right-end"
                className="dark:bg-white dark:text-black"
              >
                <h3
                  className="text-sm text-gray-900 dark:text-gray-100 hover:cursor-pointer
                hover:underline"
                >
                  {fullName}
                </h3>
              </Tooltip>

              {post.tagged_users?.data?.length > 0 && (
                <TaggedUsersText
                  taggedUsers={post.tagged_users.data}
                  totalTaggedUsers={post.total_tagged_users}
                  onViewProfile={() => {}}
                  onOpenModal={() => {}}
                />
              )}

              {post.privacy === PostPrivaciesEnum.only_friend ? (
                <Users size={15} className="opacity-70" />
              ) : post.privacy === PostPrivaciesEnum.only_me ? (
                <Lock size={15} className="opacity-70" />
              ) : (
                <Globe size={15} className="opacity-70" />
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.profile.username} • {postedTime}
            </p>
          </div>
        </div>

        {post.deleted_at ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalConfirmOpen(true)}
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
              aria-label="Restore post"
              disabled={isPending}
            >
              <LockOpen className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <ConfirmDeletePostModal
            post={post}
            onDelete={onDelete}
            isPending={isPending}
          />
        )}
      </div>

      {post.contents.length > 0 && (
        <div className="px-5">
          {post.contents.map((content, index) => (
            <p
              key={content.id ?? `content-${index}`}
              className="text-gray-800 dark:text-gray-200 mb-2 text-[15px] leading-relaxed"
            >
              {content.content}
            </p>
          ))}
        </div>
      )}

      {post.images?.length > 0 && (
        <PostMediaItem
          post={post}
          images={post.images}
          shouldHideAction={true}
        />
      )}

      {post.videos.length > 0 && (
        <div className="border-y border-gray-200 dark:border-gray-800">
          <video
            src={post.videos[0].video_url}
            controls
            className="w-full max-h-[500px] rounded-sm"
          />
        </div>
      )}

      {post?.hashtags?.length !== 0 && (
        <div className="flex flex-wrap gap-2 mt-2 px-5">
          {post.hashtags.map((tag, index) => (
            <span
              key={tag.id ?? `tag-${index}`}
              className="text-xs cursor-pointer text-blue-500 bg-blue-100 
            px-2 py-0.5 rounded-full dark:text-blue-700 dark:bg-blue-50"
            >
              #{tag.hashtag}
            </span>
          ))}
        </div>
      )}

      {post.parent_post_id && (
        <>
          {post.parent_post ? (
            <>
              <div className="px-4">
                <PostCard post={post.parent_post} setPosts={setPosts} />
              </div>
            </>
          ) : (
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 
  dark:border-gray-800 transition hover:shadow-md overflow-hidden h-[150px] mx-8 flex items-center
    flex-col justify-center md:gap-2 gap-1 text-center"
            >
              <AlertTriangle className="text-yellow-500 w-10 h-10 flex-shrink-0" />

              <p className="text-sm text-gray-600 dark:text-gray-300">
                This content is no longer available. It may have been removed by
                an admin or the user who shared it.
              </p>
            </div>
          )}
        </>
      )}

      <Divider className="dark:bg-white/10 mx-4 mt-4 mb-2" />

      <div className="px-5 pb-3">
        <div
          className="flex items-center justify-between text-gray-500 
        dark:text-gray-400 text-sm"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                if (post.total_likes > 0) setIsViewedLikedUserModal(true);
              }}
            >
              <Heart
                className={`h-4 w-4 ${post.likedByCurrentUser ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{post.total_likes}</span>
            </Button>
            <ViewUserCommentsModal post={post} setPosts={setPosts} />
            <ViewUserSharesModal post={post} />
          </div>
        </div>

        {post.topLikedUsers.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Liked by{" "}
              <span className="font-bold">
                {post.topLikedUsers[0].full_name}
              </span>
              {post.total_likes > 1 && ` and ${post.total_likes - 1} others`}
            </span>
          </div>
        )}

        {isViewedLikedUserModal && (
          <ViewLikedUsersDetaiModal
            isOpen={isViewedLikedUserModal}
            setIsOpen={setIsViewedLikedUserModal}
            post={post}
          />
        )}

        {isModalConfirmOpen && (
          <ConfirmModal
            open={isModalConfirmOpen}
            onOpenChange={setIsModalConfirmOpen}
            onCancel={() => setIsModalConfirmOpen(false)}
            isLoading={isPending}
            onConfirm={onConfirm}
            textHeader="Confirm Post Restore"
            title={`Are you sure you want to restore this post by ${post.user.profile.first_name} ${post.user.profile.last_name}?`}
            description="This post will be restored right away."
            confirmText="Restore Post"
            cancelText="No, go back"
          />
        )}
      </div>
    </div>
  );
};

export default PostCard;
