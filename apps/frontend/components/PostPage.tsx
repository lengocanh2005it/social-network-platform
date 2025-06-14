"use client";
import NotFoundPage from "@/app/not-found";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import CommentItem from "@/components/post/CommentItem";
import PostContent from "@/components/post/PostContent";
import PostHeader from "@/components/post/PostHeader";
import PostOptions from "@/components/post/PostOptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateComment, useGetComments, useGetPostOfUser } from "@/hooks";
import { getComments } from "@/lib/api/posts";
import {
  PostDetails,
  useCommentStore,
  usePostStore,
  useUserStore,
} from "@/store";
import {
  CreateCommentDto,
  CreateCommentTargetType,
  GroupedComment,
} from "@/utils";
import { Avatar, Spinner } from "@heroui/react";
import { PostContentType, PostContentTypeEnum } from "@repo/db";
import { AxiosError } from "axios";
import {
  Camera,
  SendHorizontal,
  SmileIcon,
  Star,
  Sticker,
  WandSparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface PostPageProps {
  username: string;
  postId: string;
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

const PostPageDetails: React.FC<PostPageProps> = ({ username, postId }) => {
  const { user } = useUserStore();
  const { data, isLoading, error } = useGetPostOfUser(
    user?.id ?? "",
    username,
    postId,
  );
  const [post, setPost] = useState<PostDetails | null>(null);
  const { data: commentsData, isLoading: isCommentsLoading } = useGetComments(
    post?.id ?? "",
  );
  const [comment, setComment] = useState<string>("");
  const statusCode = (
    (error as AxiosError)?.response?.data as Record<string, string | number>
  )?.statusCode;
  const messageError = (
    (error as AxiosError)?.response?.data as Record<string, string | number>
  )?.message;
  const { mutate: mutateCreateComment } = useCreateComment();
  const { updatePost } = usePostStore();
  const { addNewComments, addOldComments, commentsByPostId, setComments } =
    useCommentStore();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const hasFetchedComments = useRef(false);
  const searchParams = useSearchParams();
  const commentIdToFind = searchParams.get("commentId");
  const postIdValue = post?.id;
  const comments = commentsByPostId[postId];

  useEffect(() => {
    if (!commentIdToFind || !post || isFetching) return;

    const tryFindAndScroll = async () => {
      let el = document.getElementById(commentIdToFind);

      if (el) {
        highlight(el);
        return;
      }

      await new Promise((r) => setTimeout(r, 100));

      el = document.getElementById(commentIdToFind);
      if (el) {
        highlight(el);
      }
    };

    const highlight = (el: HTMLElement) => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.className = `bg-gray-200 p-2 rounded-lg w-full`;
      setTimeout(() => {
        el.className = "";
      }, 3000);
    };

    tryFindAndScroll();
  }, [commentIdToFind, postIdValue, comments, isFetching, post]);

  useEffect(() => {
    if (!commentIdToFind) return;

    const el = document.getElementById(commentIdToFind);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsFetching(false);
    }
  }, [commentIdToFind]);

  useEffect(() => {
    if (!hasFetchedComments.current && commentsData?.data && post) {
      setNextCursor(commentsData.nextCursor ?? null);
      hasFetchedComments.current = true;
    }
  }, [commentsData, post]);

  const handleGetNewComments = async () => {
    if (!nextCursor || !post) return;

    setIsFetching(true);

    try {
      const res = await getComments(post.id, { after: nextCursor });

      if (res && res?.data) {
        if (res?.data?.length) {
          addOldComments(post.id, res?.data);
        }

        setNextCursor(res?.nextCursor ? res.nextCursor : null);
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (commentsData) {
      setComments(postId, commentsData?.data);
    }
  }, [commentsData, setComments, postId]);

  const handleSubmit = () => {
    if (comment?.trim() === "" || !post) return;

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
      targetType: CreateCommentTargetType.POST,
      contents: textBlocks,
      post_id: post.id,
    };

    mutateCreateComment(createCommentDto, {
      onSuccess: (data: { post: PostDetails; comments: GroupedComment[] }) => {
        if (data) {
          if (data?.post) {
            updatePost(post.id, data?.post);
          }

          if (data?.comments) {
            data?.comments.forEach((comment) => {
              addNewComments(post.id, comment);
            });
          }
        }

        setComment("");
      },
    });
  };

  useEffect(() => {
    if (data) {
      setPost(data);
    }
  }, [data, setPost]);

  if (statusCode && messageError) return <NotFoundPage />;

  if (isLoading) return <PrimaryLoading />;

  return (
    <>
      {post && (
        <>
          <section className="flex flex-col md:gap-3 gap-2 relative max-w-2xl mx-auto md:pb-4 pb-3">
            <div className="flex flex-col border border-black/10 p-2 rounded-lg">
              <PostHeader homePost={post} shouldHiddenXCloseIcon />
              <PostContent homePost={post} />
              <PostOptions post={post} shouldShowCommentOption={false} />
            </div>

            <div className="flex flex-col md:gap-3 gap-2">
              {commentsByPostId[postId]?.length > 0 ? (
                <>
                  <ScrollArea
                    className="max-h-[300px] overflow-auto relative border-t
                   border-black/10 pt-2"
                  >
                    <div className="flex flex-col md:gap-2 gap-1">
                      {commentsByPostId[postId]?.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          post={post}
                          comment={comment}
                        />
                      ))}

                      {isFetching && (
                        <div
                          className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
                          flex-col items-center justify-center text-center"
                        >
                          <Spinner />

                          <p>Loading...</p>
                        </div>
                      )}
                    </div>

                    {nextCursor && !isFetching && (
                      <p
                        className="text-xs text-end hover:underline hover:text-blue-600
                         cursor-pointer transition-all pr-3"
                        onClick={handleGetNewComments}
                      >
                        See more comments
                      </p>
                    )}
                  </ScrollArea>
                </>
              ) : (
                <>
                  <div
                    className="flex flex-col md:gap-1 md:mb-3
                    mb-2 text-center items-center justify-center md:mt-3 mt-2"
                  >
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                      No comments yet
                    </h1>

                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Be the first to share your thoughts and start the
                      conversation.
                    </p>
                  </div>
                </>
              )}

              <div className="flex md:gap-3 gap-2">
                {user && (
                  <Avatar
                    src={user.profile.avatar_url}
                    className="cursor-pointer select-none w-10 h-10 flex-shrink-0 rounded-full"
                  />
                )}

                <div className="w-full bg-gray-100 rounded-xl p-3">
                  <textarea
                    rows={1}
                    placeholder="Write a comment..."
                    className="w-full bg-transparent resize-none focus:outline-none text-sm"
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2 relative">
                      {icons.map((icon) => (
                        <button
                          className="text-gray-500 hover:text-gray-700 transition-all"
                          key={icon.key}
                        >
                          {icon.icon}
                        </button>
                      ))}
                    </div>

                    {comment?.trim() !== "" && (
                      <button className="text-gray-500 hover:text-gray-700">
                        <SendHorizontal
                          className="w-5 h-5"
                          onClick={handleSubmit}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isCommentsLoading && <PrimaryLoading />}
          </section>
        </>
      )}
    </>
  );
};

export default PostPageDetails;
