"use client";
import ViewCommentLikedDetailsModal from "@/components/modal/ViewCommentLikedDetailsModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  useCreateCommentReply,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
} from "@/hooks";
import { getCommentReplies } from "@/lib/api/posts";
import {
  PostDetails,
  useCommentStore,
  usePostStore,
  useUserStore,
} from "@/store";
import { CreateCommentReplyDto, formatDateTime, GroupedComment } from "@/utils";
import { Avatar, Spinner } from "@heroui/react";
import { PostContentType, PostContentTypeEnum, RoleEnum } from "@repo/db";
import {
  Camera,
  SendHorizontal,
  SmileIcon,
  Star,
  Sticker,
  WandSparkles,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CommentItemProps {
  comment: GroupedComment;
  post: PostDetails;
  level?: number;
  hasSibling?: boolean;
  parentId?: string;
  shouldHideLikeButton?: boolean;
  shouldHideCommentButton?: boolean;
  onDelete?: () => void;
  cursor?: string;
  loadNewComments?: () => void;
  setPosts?: React.Dispatch<React.SetStateAction<PostDetails[]>>;
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

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  post,
  level = 0,
  parentId,
  shouldHideCommentButton,
  shouldHideLikeButton,
  onDelete,
  cursor,
  loadNewComments,
  setPosts,
}) => {
  const [showReplyBox, setShowReplyBox] = React.useState<boolean>(false);
  const [replyText, setReplyText] = React.useState<string>("");
  const { user } = useUserStore();
  const {
    deleteComment,
    updateComment,
    setReplies,
    repliesByCommentId,
    addNewReply,
    deleteReply,
    commentsByPostId,
    addOldReplies,
    updateReply,
  } = useCommentStore();
  const { updatePost, updateHomePost } = usePostStore();
  const { mutate: mutateDeleteComment } = useDeleteComment();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [liked, setLiked] = useState(comment.likedByCurrentUser ?? false);
  const { mutate: mutateLikeComment } = useLikeComment();
  const { mutate: mutateUnlikeComment } = useUnlikeComment();
  const { mutate: mutateCreateCommentReply } = useCreateCommentReply();

  useEffect(() => {
    setLiked(comment.likedByCurrentUser);
  }, [setLiked, comment]);

  const handleDelete = (commentId: string, postId: string) => {
    mutateDeleteComment(
      {
        commentId: comment.id,
        postId: post.id,
      },
      {
        onSuccess: (data) => {
          if (data) {
            console.log("Data: ", data);
            console.log("Set posts function: ", setPosts);

            if (setPosts) {
              setPosts((prev) =>
                prev.map((p) => {
                  if (p.id === post.id) {
                    return {
                      ...p,
                      total_comments: data?.total_comments ?? 0,
                    };
                  }
                  return p;
                }),
              );
            }

            updateHomePost(post.id, data);
            updatePost(post.id, data);

            deleteComment(postId, commentId);

            if (parentId) {
              deleteReply(parentId, comment.id);

              const findComment = commentsByPostId[post.id].find(
                (p) => p.id === parentId,
              );

              if (findComment) {
                updateComment(post.id, findComment.id, {
                  total_replies: findComment.total_replies - 1,
                });
              }

              updateComment(post.id, parentId, {
                total_replies: repliesByCommentId[parentId].length - 1,
              });
            }

            if (
              commentsByPostId[post.id].length - 1 <= 2 &&
              cursor &&
              loadNewComments
            ) {
              setTimeout(() => {
                loadNewComments();
              }, 150);
            }

            toast.success(
              `${user?.id === comment.user.id ? "Your comment has been successfully deleted." : "This comment has been deleted successfully."}`,
              {
                position: "bottom-right",
              },
            );
          }
        },
      },
    );
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;

    let textBlocks: { type: PostContentType; content: string }[] = [];

    if (replyText.trim() !== "") {
      const regex = /#([\p{L}\p{N}_]+)/gu;

      const linesArr = replyText
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

    const createCommentReplyDto: CreateCommentReplyDto = {
      contents: textBlocks,
      parent_comment_id: comment.id,
      post_id: post.id,
    };

    mutateCreateCommentReply(createCommentReplyDto, {
      onSuccess: (data: {
        comments: GroupedComment[];
        parentComment?: GroupedComment;
      }) => {
        if (data?.comments?.length) {
          data?.comments?.forEach((c) => addNewReply(comment.id, c));
        }

        if (data?.parentComment) {
          updateComment(post.id, comment.id, {
            total_replies: data?.parentComment?.total_replies,
          });
        }
        updatePost(post.id, {
          ...post,
          total_comments: post.total_comments + 1,
        });
        updateHomePost(post.id, {
          ...post,
          total_comments: post.total_comments + 1,
        });
        setIsOpen(true);
        setReplyText("");
        setShowReplyBox(false);
      },
    });
  };

  const handleToggleReplies = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const params = nextCursor ? { after: nextCursor } : undefined;

    setIsLoading(true);

    try {
      const res = await getCommentReplies(post.id, comment.id, params);

      if (res?.data) {
        setReplies(comment.id, res.data);
        setIsOpen(true);
      }

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMoreReplies = async () => {
    if (!nextCursor || loadMore) return;

    setLoadMore(true);

    try {
      const data = await getCommentReplies(post.id, comment.id, {
        after: nextCursor,
      });

      if (data?.data) {
        addOldReplies(comment.id, data.data);
      }

      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    } finally {
      setLoadMore(false);
    }
  };

  const handleToggleLikeComment = () => {
    if (!liked) {
      mutateLikeComment(
        { postId: post.id, commentId: comment.id },
        {
          onSuccess: (data: GroupedComment) => {
            if (!comment?.parent_id) {
              updateComment(post.id, comment.id, data);
            } else {
              updateReply(comment.parent_id, comment.id, data);
            }
            setLiked(true);
          },
        },
      );
    } else {
      mutateUnlikeComment(
        { postId: post.id, commentId: comment.id },
        {
          onSuccess: (data: GroupedComment) => {
            if (!comment?.parent_id) {
              updateComment(post.id, comment.id, data);
            } else {
              updateReply(comment.parent_id, comment.id, data);
            }
            setLiked(false);
          },
        },
      );
    }
  };

  return (
    <div
      className="relative"
      id={comment.id}
      style={{ marginLeft: level > 0 ? 24 : 0 }}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex gap-2 group relative w-fit">
            <div className="relative flex-shrink-0">
              <Avatar
                src={comment.user.avatar_url}
                alt={comment.user.full_name}
                className="select-none cursor-pointer flex-shrink-0"
              />
            </div>

            <div className="flex-1 min-w-0 relative">
              <div
                className={`bg-gray-100 dark:bg-white/20 p-2 rounded-lg max-w-fit relative ${
                  comment.total_likes > 0 ? "pb-8" : "pb-2"
                }`}
              >
                <p className="font-bold truncate">{comment.user.full_name}</p>

                <p className="text-black/80 dark:text-white/80 break-all whitespace-pre-wrap">
                  {comment.content}
                </p>

                {comment.total_likes > 0 && (
                  <ViewCommentLikedDetailsModal comment={comment} post={post} />
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-white/70">
                <span>{formatDateTime(comment.created_at)}</span>
                {!shouldHideLikeButton && (
                  <button
                    onClick={handleToggleLikeComment}
                    className={`cursor-pointer transition-colors ${
                      liked
                        ? "text-blue-600"
                        : "hover:text-gray-700 dark:hover:text-white/50"
                    }`}
                  >
                    {liked ? "Liked" : "Like"}
                  </button>
                )}
                {!shouldHideCommentButton && (
                  <button
                    className="cursor-pointer hover:text-gray-700 dark:hover:text-white/50"
                    onClick={() => setShowReplyBox((prev) => !prev)}
                  >
                    Reply
                  </button>
                )}

                {((user?.id === comment.user.id &&
                  post?.user?.id !== user?.id) ||
                  post?.user?.id === user?.id ||
                  user?.role === RoleEnum.admin) && (
                  <button
                    className="cursor-pointer hover:text-gray-700 dark:hover:text-white/50"
                    onClick={() => {
                      if (onDelete) {
                        onDelete();
                      } else {
                        handleDelete(comment.id, post.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>

              {(repliesByCommentId[comment.id]?.length > 0 ||
                comment.total_replies > 0) && (
                <button
                  className="text-xs text-blue-500 hover:underline ml-2 mt-1 cursor-pointer"
                  onClick={handleToggleReplies}
                >
                  {isOpen
                    ? "Close"
                    : `View ${repliesByCommentId[comment.id]?.length || comment.total_replies} repl${(repliesByCommentId[comment.id]?.length || comment.total_replies) > 1 ? "ies" : "y"}`}
                </button>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => handleDelete(comment.id, post.id)}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {showReplyBox && (
        <div className="flex items-center md:gap-2 gap-1 mt-2 md:pl-12 pl-8 pb-2">
          <div className="flex md:gap-3 gap-2 flex-1">
            <Avatar
              src={user?.profile.avatar_url}
              className="rounded-full w-10 h-10 select-none"
            />

            <div className="w-full bg-gray-100 dark:bg-white/20 rounded-xl p-3 flex-1">
              <textarea
                rows={1}
                placeholder="Write a comment..."
                className="w-full bg-transparent resize-none focus:outline-none text-sm"
                onChange={(e) => setReplyText(e.target.value)}
                value={replyText}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReplySubmit();
                  }
                }}
              />

              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  {icons.map((icon) => (
                    <button
                      className="text-gray-500 hover:text-gray-700 transition-all
                      dark:text-white/70 dark:hover:text-white"
                      key={icon.key}
                    >
                      {icon.icon}
                    </button>
                  ))}
                </div>

                {replyText?.trim() !== "" && (
                  <button
                    className="text-gray-500 hover:text-gray-700
                  dark:text-white/80 dark:hover:text-white"
                  >
                    <SendHorizontal
                      className="w-5 h-5"
                      onClick={handleReplySubmit}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
        flex-col items-center justify-center text-center"
        >
          <Spinner />

          <p>Loading...</p>
        </div>
      )}

      {repliesByCommentId[`${comment.id}`]?.length > 0 &&
        !isLoading &&
        isOpen && (
          <div className="mt-2 flex flex-col md:gap-2 gap-1">
            {repliesByCommentId[`${comment.id}`]?.map((reply, index) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                level={level + 1}
                hasSibling={
                  index < repliesByCommentId[`${comment.id}`]?.length - 1
                }
                parentId={comment.id}
                post={post}
                shouldHideCommentButton={user?.role === RoleEnum.admin}
                shouldHideLikeButton={user?.role === RoleEnum.admin}
                setPosts={setPosts}
              />
            ))}
          </div>
        )}

      {loadMore && isOpen && (
        <div
          className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
         flex-col items-center justify-center text-center"
        >
          <Spinner />

          <p>Loading...</p>
        </div>
      )}

      {isOpen && nextCursor && (
        <button
          className="text-xs text-blue-500 hover:underline ml-2 cursor-pointer
        mt-2 md:pl-12 pl-8 pb-2"
          onClick={handleLoadMoreReplies}
        >
          View more replies
        </button>
      )}
    </div>
  );
};

export default CommentItem;
