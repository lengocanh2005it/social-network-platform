"use client";
import ConfirmModal from "@/components/modal/ConfirmModal";
import UpdatePostModal from "@/components/modal/UpdatePostModal";
import ViewPostModal from "@/components/modal/ViewPostModal";
import ViewTaggedUsersModal from "@/components/modal/ViewTaggedUsersModal";
import ParentPostDetails from "@/components/post/ParentPostDetails";
import PostMediaItem from "@/components/post/PostMediaItem";
import PostOptions from "@/components/post/PostOptions";
import { TaggedUsersText } from "@/components/TaggedUsersText";
import GlobalIcon from "@/components/ui/icons/global";
import UndoPostToast from "@/components/UndoPostToast";
import { useDeletePost, useUpdatePost } from "@/hooks";
import { uploadMedia } from "@/lib/api/uploads";
import {
  PostDetails,
  useMediaStore,
  usePostStore,
  useUserStore,
} from "@/store";
import {
  CreatePostImageDto,
  CreatePostVideoDto,
  formatDateTime,
  HIDE_DURATION,
  UpdatePostDto,
} from "@/utils";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  PostContentType,
  PostContentTypeEnum,
  PostPrivaciesEnum,
  PostPrivaciesType,
} from "@repo/db";
import {
  AlertTriangle,
  Ellipsis,
  EyeOff,
  Lock,
  SquarePen,
  Trash,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ProfilePostsProps {
  post: PostDetails;
}

const ProfilePosts: React.FC<ProfilePostsProps> = ({ post }) => {
  const {
    user,
    viewedUser,
    setSelectedTaggedUsers,
    setOriginalTaggedUsers,
    setTempSelectedTaggedUsers,
  } = useUserStore();
  const { hidePost, posts, restorePostAtIndex } = usePostStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    mutate: mutateDeletePost,
    isSuccess,
    isError,
    isPending,
  } = useDeletePost();
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const {
    clearMediaFiles,
    clearDeletedMediaFiles,
    clearNewMediaFiles,
    deletedMediaFiles,
  } = useMediaStore();
  const { mutate: mutateUpdatePost } = useUpdatePost();
  const [isShowPostModal, setIsShowPostModal] = useState<boolean>(false);
  const [isShowParentPostModal, setIsShowParentPostModal] =
    useState<boolean>(false);
  const router = useRouter();
  const [isShowTaggedUsersModal, setIsShowTaggedUsersModal] =
    useState<boolean>(false);

  const handleConfirmClick = async (postId: string) => {
    mutateDeletePost(postId);
  };

  const viewProfileClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handleHidePost = (postId: string) => {
    const index = posts.findIndex((p) => p.id === postId);

    const post = posts[index];

    if (index === -1 || !post) return;

    hidePost(postId);

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
      restorePostAtIndex(post, index);
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

  useEffect(() => {
    if (isSuccess) setIsOpen(false);
    if (isError) setIsOpen(true);
  }, [isSuccess, isError]);

  const handleUpdate = async (
    content: string,
    privacy: PostPrivaciesType,
    images?: File[],
    videos?: File[],
    tags?: string[],
  ) => {
    const hashtags: string[] = [];

    let textBlocks: { type: PostContentType; content: string }[] = [];

    if (content.trim() !== "") {
      const regex = /#([\p{L}\p{N}_]+)/gu;

      const matches = [...content.matchAll(regex)];
      const uniqueHashtags = [...new Set(matches.map((m) => `${m[1]}`))];
      hashtags.push(...uniqueHashtags);

      const linesArr = content
        .split("\n")
        .map((line) => line.replace(regex, "").trim())
        .filter((line) => line !== "");

      if (linesArr.length > 0) {
        const formattedContent = linesArr.length > 1 ? linesArr : linesArr[0];

        textBlocks =
          typeof formattedContent === "string"
            ? [{ type: PostContentTypeEnum.text, content: formattedContent }]
            : formattedContent.map((line) => ({
                type: PostContentTypeEnum.text,
                content: line,
              }));
      }
    }

    let imageFiles: CreatePostImageDto[] = [];

    let videoFiles: CreatePostVideoDto[] = [];

    if (images?.length || videos?.length) {
      if (images?.length) {
        const response = await uploadMedia(images);

        if (response && response?.media) {
          imageFiles = response?.media.map((rm) => ({
            image_url: rm.fileUrl,
          })) as CreatePostImageDto[];
        }
      }

      if (videos?.length) {
        const response = await uploadMedia(videos);

        if (response && response?.media)
          videoFiles = response?.media.map((rm) => ({
            video_url: rm.fileUrl,
          })) as CreatePostVideoDto[];
      }
    }

    const updatePostDto: UpdatePostDto = {
      privacy,
      ...(imageFiles?.length !== 0 && { images: imageFiles }),
      ...(videoFiles?.length !== 0 && { videos: videoFiles }),
      ...(deletedMediaFiles?.length !== 0 && {
        deletedMediaDto: deletedMediaFiles.map((dm) => ({
          type: dm.type,
          url: dm.url,
        })),
      }),
      contents: textBlocks,
      ...(hashtags?.length !== 0 && { hashtags }),
      ...(tags && tags?.length > 0 && { tags }),
    };

    mutateUpdatePost({
      updatePostDto,
      postId: post.id,
    });
  };

  return (
    <>
      {user && (
        <>
          <div
            className="bg-white border border-black/10 rounded-xl md:mb-6 md-4 p-4
          dark:bg-black dark:text-white dark:border-white/30"
          >
            <div className="flex flex-col md:gap-2 gap-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center mb-3 gap-2">
                  <Avatar
                    src={post.user.profile.avatar_url}
                    alt={
                      post.user.profile.first_name +
                      " " +
                      post.user.profile.last_name
                    }
                    className="object-cover cursor-pointer select-none flex-shrink-0 w-10 h-10"
                    onClick={() => viewProfileClick(post.user.profile.username)}
                  />

                  <div className="flex flex-col relative">
                    <div className="flex items-center gap-1">
                      <h4
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() =>
                          viewProfileClick(post.user.profile.username)
                        }
                      >
                        {post.user.profile.first_name +
                          " " +
                          post.user.profile.last_name}
                      </h4>

                      {post.tagged_users?.data?.length > 0 && (
                        <TaggedUsersText
                          taggedUsers={post.tagged_users.data}
                          totalTaggedUsers={post.total_tagged_users}
                          onViewProfile={viewProfileClick}
                          onOpenModal={() => setIsShowTaggedUsersModal(true)}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-white/70">
                      <span className="leading-none">
                        {formatDateTime(new Date(post.created_at))}
                      </span>

                      {post.privacy === PostPrivaciesEnum.only_friend ? (
                        <Users
                          width={16}
                          height={16}
                          className="inline-block align-middle"
                        />
                      ) : post.privacy === PostPrivaciesEnum.only_me ? (
                        <Lock
                          width={16}
                          height={16}
                          className="inline-block align-middle"
                        />
                      ) : (
                        <GlobalIcon width={16} height={16} />
                      )}
                    </div>
                  </div>
                </div>

                {viewedUser?.id === user?.id && (
                  <div className="flex items-center md:gap-3 gap-2">
                    <Dropdown
                      placement="bottom-end"
                      className="text-black dark:text-white"
                      shouldBlockScroll={false}
                    >
                      <DropdownTrigger>
                        <Ellipsis
                          size={30}
                          className="cursor-pointer focus:outline-none dark:text-white/70"
                        />
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Post options" variant="flat">
                        <DropdownItem
                          key="hide-post"
                          startContent={<EyeOff />}
                          onClick={() => handleHidePost(post.id)}
                        >
                          Hide post
                        </DropdownItem>
                        <DropdownItem
                          key="update-post"
                          onClick={() => {
                            setOpenUpdateModal(true);
                            if (post?.tagged_users?.data) {
                              setSelectedTaggedUsers(
                                post.tagged_users.data.map((tu) => ({
                                  user_id: tu.user_id,
                                  username: tu.username,
                                  avatar_url: tu.avatar_url,
                                  mutual_friends: tu.mutual_friends,
                                  is_friend: tu.is_friend,
                                  full_name: tu.full_name,
                                })),
                              );

                              setOriginalTaggedUsers(
                                post.tagged_users.data.map((tu) => ({
                                  user_id: tu.user_id,
                                  username: tu.username,
                                  avatar_url: tu.avatar_url,
                                  mutual_friends: tu.mutual_friends,
                                  is_friend: tu.is_friend,
                                  full_name: tu.full_name,
                                })),
                              );
                            }
                          }}
                          startContent={<SquarePen />}
                        >
                          Update post
                        </DropdownItem>
                        <DropdownItem
                          key="delete-post"
                          startContent={<Trash />}
                          onClick={() => setIsOpen(true)}
                        >
                          Delete post
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                )}
              </div>

              {(post?.contents?.length !== 0 ||
                post?.hashtags?.length !== 0) && (
                <section className="flex flex-col md:gap-2 gap-1 relative">
                  {post?.contents?.length !== 0 && (
                    <div className="flex flex-col relative md:gap-2 gap-1 text-black/80 dark:text-white/80">
                      {post.contents.map((ct) => (
                        <p className="text-sm whitespace-pre-wrap" key={ct.id}>
                          {ct.content}
                        </p>
                      ))}
                    </div>
                  )}

                  {post?.hashtags?.length !== 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.hashtags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs cursor-pointer text-blue-500 bg-blue-100 
                          px-2 py-0.5 rounded-full dark:text-blue-700 dark:bg-blue-50"
                        >
                          #{tag.hashtag}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <PostMediaItem images={post.images} post={post} />

              {post.parent_post_id && (
                <>
                  {post.parent_post ? (
                    <>
                      <ParentPostDetails
                        parentPost={post.parent_post}
                        onClick={() => {
                          setIsShowParentPostModal(true);
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className="p-6 flex flex-col items-center justify-center
                      text-center border border-black/10 dark:border-white/20
                      rounded-lg gap-2 md:mb-3 mb-2"
                      >
                        <AlertTriangle className="text-yellow-500 w-10 h-10 flex-shrink-0" />

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          This content is no longer available. It may have been
                          removed by an admin or the user who shared it.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              <PostOptions
                post={post}
                setIsOpen={setIsShowPostModal}
                shouldShowCommentOption
              />
            </div>
          </div>

          {isOpen && (
            <ConfirmModal
              open={isOpen}
              onOpenChange={setIsOpen}
              onCancel={() => setIsOpen(false)}
              isLoading={isPending}
              onConfirm={() => handleConfirmClick(post.id)}
              textHeader="Confirm Post Delete"
              title="Are you sure you want to delete this post?"
              description="This post will be permanently removed."
              confirmText="Delete Post"
              cancelText="No, go back"
            />
          )}

          {openUpdateModal && (
            <UpdatePostModal
              open={openUpdateModal}
              onOpenChange={(isOpen) => {
                setOpenUpdateModal(isOpen);
                clearMediaFiles();
                clearDeletedMediaFiles();
                clearNewMediaFiles();
                setSelectedTaggedUsers([]);
                setOriginalTaggedUsers([]);
                setTempSelectedTaggedUsers([]);
              }}
              post={post}
              onUpdate={async ({ content, images, videos, privacy, tags }) =>
                handleUpdate(content, privacy, images, videos, tags)
              }
            />
          )}

          {isShowPostModal && (
            <ViewPostModal
              homePost={post}
              isOpen={isShowPostModal}
              setIsOpen={setIsShowPostModal}
            />
          )}

          {isShowParentPostModal && post?.parent_post && (
            <ViewPostModal
              homePost={post.parent_post}
              isOpen={isShowParentPostModal}
              setIsOpen={setIsShowParentPostModal}
            />
          )}

          {isShowTaggedUsersModal && post && (
            <ViewTaggedUsersModal
              isOpen={isShowTaggedUsersModal}
              setIsOpen={setIsShowTaggedUsersModal}
              post={post}
            />
          )}
        </>
      )}
    </>
  );
};

export default ProfilePosts;
