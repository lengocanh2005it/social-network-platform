"use client";
import GlobalIcon from "@/components/ui/icons/global";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreateComment,
  useDeleteComment,
  useGetCommentsMedia,
  useGetMediaOfPost,
  useLikeMediaPost,
  useUnlikeMediaPost,
} from "@/hooks";
import { getCommentsOfMedia } from "@/lib/api/posts";
import { PostDetails, useUserStore } from "@/store";
import {
  CreateCommentDto,
  CreateCommentTargetType,
  formatDateTime,
  handleAxiosError,
  MediaCommentType,
  MediaDetails,
} from "@/utils";
import { Avatar, Button, Divider } from "@heroui/react";
import {
  PostContentType,
  PostContentTypeEnum,
  PostPrivaciesEnum,
  RoleEnum,
} from "@repo/db";
import {
  Camera,
  Lock,
  SendHorizontal,
  Share2,
  SmileIcon,
  Star,
  Sticker,
  ThumbsUpIcon,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ViewPostMediaDetailsOverlayProps {
  post: PostDetails;
  mediaId: string;
  mediaUrl: string;
  type: "video" | "image";
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  shouldHideAction?: boolean;
}

const icons = [
  {
    key: 1,
    icon: <Star className="w-5 h-5" />,
    label: "",
  },
  {
    key: 2,
    icon: <SmileIcon className="w-5 h-5" />,
    label: "",
  },
  {
    key: 3,
    icon: <Camera className="w-5 h-5" />,
    label: "",
  },
  {
    key: 4,
    icon: <WandSparkles className="w-5 h-5" />,
    label: "",
  },
  {
    key: 5,
    icon: <Sticker className="w-5 h-5" />,
    label: "",
  },
];

const ViewPostMediaDetailsOverlay: React.FC<
  ViewPostMediaDetailsOverlayProps
> = ({ post, mediaId, mediaUrl, type, setIsOpen, shouldHideAction }) => {
  const { user } = useUserStore();
  const [comment, setComment] = React.useState<string>("");
  const { data } = useGetMediaOfPost(post.id, mediaId, type);
  const { data: commentsData } = useGetCommentsMedia(post.id, mediaId, {
    type,
  });
  const [media, setMedia] = useState<MediaDetails | null>(null);
  const [liked, setLiked] = useState(media?.likedByCurrentUser);
  const [comments, setComments] = useState<MediaCommentType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { mutate: mutateLikeMediaPost } = useLikeMediaPost();
  const { mutate: mutateUnlikeMediaPost } = useUnlikeMediaPost();
  const { mutate: mutateCreateComment } = useCreateComment();
  const { mutate: mutateDeleteComment, isPending } = useDeleteComment();
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    setLiked(media?.likedByCurrentUser ? true : false);
  }, [setLiked, media]);

  useEffect(() => {
    if (data) {
      setMedia(data);
    }

    if (commentsData?.data) {
      setComments(commentsData.data);
    }

    setNextCursor(commentsData?.nextCursor ? commentsData.nextCursor : null);
  }, [data, setMedia, commentsData, setComments, setNextCursor]);

  const toggleLike = () => {
    if (liked) {
      mutateUnlikeMediaPost(
        {
          postId: post.id,
          mediaId,
          unlikeMediaPostQueryDto: {
            type,
          },
        },
        {
          onSuccess: (data: MediaDetails) => {
            if (data) {
              setMedia(data);
              setLiked(false);
            }
          },
        },
      );
    } else {
      mutateLikeMediaPost(
        {
          postId: post.id,
          mediaId,
          likeMediaPostDto: {
            type,
          },
        },
        {
          onSuccess: (data: MediaDetails) => {
            if (data) {
              setMedia(data);
              setLiked(true);
            }
          },
        },
      );
    }
  };

  const handleCreateComment = async () => {
    if (!comment || comment?.trim() === "") return;

    let textBlocks: { type: PostContentType; content: string }[] = [];

    if (comment.trim() !== "") {
      const regex = /#([\p{L}\p{N}_]+)/gu;

      const linesArr = comment
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

    const createCommentDto: CreateCommentDto = {
      contents: textBlocks,
      targetType:
        type === "image"
          ? CreateCommentTargetType.IMAGE
          : CreateCommentTargetType.VIDEO,
      post_id: post.id,
      media_id: mediaId,
    };

    mutateCreateComment(createCommentDto, {
      onSuccess: (data: {
        post_media: MediaDetails;
        comments: MediaCommentType[];
      }) => {
        if (data && data?.comments?.length && data?.post_media) {
          setComments((prev) => [...data.comments, ...prev]);
          setMedia((prev) => ({
            ...prev,
            ...data?.post_media,
          }));
          setComment("");
        }
      },
    });
  };

  const handleLoadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const data = await getCommentsOfMedia(post.id, mediaId, {
        type,
        after: nextCursor,
      });

      if (data?.data) {
        setComments((prev) => [...prev, ...data.data]);
      }

      setNextCursor(data?.nextCursor);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    mutateDeleteComment(
      {
        commentId,
        postId: post.id,
      },
      {
        onSuccess: async (data) => {
          if (media && data) {
            setMedia((prev) => ({
              ...prev!,
              total_comments: prev!.total_comments - 1,
            }));

            setComments((prev) => prev.filter((p) => p.id !== commentId));

            if (comments.length - 1 <= 2 && nextCursor) {
              setTimeout(() => {
                handleLoadMore();
              }, 150);
            }

            toast.success("This comment has been deleted successfully.", {
              position: "bottom-right",
            });
          }
        },
      },
    );
  };

  return (
    <>
      {media && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          <div
            className="pt-4 mx-4 flex md:flex-row flex-col justify-between items-center text-white 
      border-b pb-3 border-white/70"
          >
            <div className="flex items-center md:gap-2 gap-1">
              <Avatar
                src={post.user.profile.avatar_url}
                alt="avatar"
                className="select-none cursor-pointer"
              />

              <div className="flex relative items-center md:gap-3 gap-2">
                <div className="flex flex-col relative">
                  <h1 className="font-semibold">
                    {post.user.profile.first_name +
                      " " +
                      post.user.profile.last_name}
                  </h1>

                  <p className="text-sm text-gray-400">
                    {formatDateTime(post.created_at)}
                  </p>
                </div>

                {post.privacy === PostPrivaciesEnum.only_friend ? (
                  <Users width={22} height={22} />
                ) : post.privacy === PostPrivaciesEnum.only_me ? (
                  <Lock width={22} height={22} />
                ) : (
                  <GlobalIcon width={22} height={22} />
                )}
              </div>
            </div>

            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X />
            </Button>
          </div>

          <div className="flex flex-1 flex-col md:flex-row md:gap-6 gap-4 overflow-hidden p-6">
            <div className="flex-1 relative flex flex-col justify-center items-center">
              {type === "image" ? (
                <Image
                  src={mediaUrl}
                  alt="media"
                  fill
                  className="rounded-lg select-none cursor-pointer"
                />
              ) : (
                <video
                  src={mediaUrl}
                  controls
                  className="max-h-[90vh] max-w-full rounded"
                />
              )}
            </div>

            <ScrollArea
              className="w-full h-full md:w-[500px] bg-black text-white p-4 
              border-l border-white/10"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:gap-2 gap-1">
                  {(media.total_likes > 0 ||
                    media.total_shares > 0 ||
                    media.total_comments > 0) && (
                    <div className="flex items-center justify-end md:gap-2 gap-1 md:mb-2 mb-1">
                      {media.total_likes > 0 && (
                        <p>
                          {media.total_likes} Like{media.total_likes > 1 && "s"}
                        </p>
                      )}

                      {media.total_comments > 0 && (
                        <p>
                          {media.total_comments} Comment
                          {media.total_comments > 1 && "s"}
                        </p>
                      )}

                      {media.total_shares > 0 && (
                        <p>
                          {media.total_shares} Share
                          {media.total_shares > 1 && "s"}
                        </p>
                      )}
                    </div>
                  )}

                  {!shouldHideAction && (
                    <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white/80">
                      <div
                        className={`flex justify-center cursor-pointer items-center gap-2 p-3 
          rounded-lg transition-all duration-250 ease-in select-none ${
            liked ? "text-blue-600" : "hover:bg-white/20"
          }`}
                        onClick={toggleLike}
                      >
                        <ThumbsUpIcon
                          size={20}
                          fill={liked ? "blue" : "none"}
                          stroke={liked ? "blue" : "currentColor"}
                        />
                        <p className="text-md">{liked ? "Liked" : "Like"}</p>
                      </div>

                      <div
                        className="flex justify-center cursor-pointer items-center gap-2 
                  p-3 rounded-lg hover:bg-white/20 transition-all duration-250 ease-in select-none"
                      >
                        <Share2 size={20} />
                        <p className="text-md">Share</p>
                      </div>
                    </div>
                  )}
                </div>

                {user && !shouldHideAction && (
                  <div className="flex md:gap-3 gap-2">
                    <Avatar
                      src={user.profile.avatar_url}
                      alt="avatar"
                      className="select-none cursor-pointer w-10 h-10 object-cover rounded-full"
                    />

                    <div className="w-full bg-white/20 rounded-xl p-3 flex-1">
                      <textarea
                        rows={1}
                        placeholder="Write a comment..."
                        className="w-full bg-transparent resize-none focus:outline-none text-sm"
                        onChange={(e) => setComment(e.target.value)}
                        value={comment}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateComment();
                          }
                        }}
                      />

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-2">
                          {icons.map((icon) => (
                            <button
                              className="text-white/80 hover:text-white/90 transition-all"
                              key={icon.key}
                            >
                              {icon.icon}
                            </button>
                          ))}
                        </div>

                        {comment?.trim() !== "" && (
                          <button className="text-white/80 hover:text-white/90">
                            <SendHorizontal
                              className="w-5 h-5"
                              onClick={handleCreateComment}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {user?.role === RoleEnum.admin && (
                  <Divider className="dark:bg-white/30" />
                )}

                {comments?.length > 0 ? (
                  <>
                    <div className="flex flex-col md:gap-3 gap-2 md:mt-2 mt-1">
                      {comments.map((comment) => (
                        <div
                          className="flex gap-2 group relative w-fit"
                          key={comment.id}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar
                              src={comment.user.avatar_url}
                              alt={comment.user.full_name}
                              className="select-none cursor-pointer"
                            />
                          </div>

                          <div className="flex-1 min-w-0 relative">
                            <div
                              className={`bg-white/20 p-2 rounded-lg max-w-fit relative ${
                                comment.total_likes > 0 ? "pb-8" : "pb-2"
                              }`}
                            >
                              <p className="font-medium truncate text-white/60">
                                {comment.user.full_name}
                              </p>

                              <p className="text-white break-all whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>

                            <div
                              className="flex items-center gap-3 mt-1 text-xs 
                            text-gray-500 dark:text-white/60"
                            >
                              <span>{formatDateTime(comment.created_at)}</span>
                              {user?.role === RoleEnum.user && (
                                <button className={`cursor-pointer`}>
                                  Like
                                </button>
                              )}

                              {(user?.role === RoleEnum.admin ||
                                (user?.role === RoleEnum.user &&
                                  post.user.id === user.id) ||
                                comment.user.id === user?.id) && (
                                <button
                                  className={`cursor-pointer hover:dark:text-white/80`}
                                  onClick={() => {
                                    if (isPending) return;
                                    handleDeleteComment(comment.id);
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {nextCursor && (
                      <p
                        className="text-right mt-3 cursor-pointer hover:underline hover:text-blue-500"
                        onClick={handleLoadMore}
                      >
                        See more comments
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col md:gap-1 items-center md:mt-4 mt-3">
                    <h1>No Comments Yet</h1>

                    {user?.role === RoleEnum.admin ? (
                      <p className="text-white/70">
                        The image hasn&apos;t received any comments from users
                        yet.
                      </p>
                    ) : (
                      <p className="text-white/70">
                        Be the first to leave a comment on this{" "}
                        {type === "video" ? "video" : "image"}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewPostMediaDetailsOverlay;
