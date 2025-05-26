"use client";
import CommentItem from "@/components/post/CommentItem";
import PostContent from "@/components/post/PostContent";
import PostHeader from "@/components/post/PostHeader";
import PostOptions from "@/components/post/PostOptions";
import { useCreateComment, useGetComments } from "@/hooks";
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
import {
  Avatar,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  Spinner,
} from "@heroui/react";
import { PostContentType, PostContentTypeEnum } from "@repo/db";
import {
  Camera,
  SendHorizontal,
  SmileIcon,
  Star,
  Sticker,
  WandSparkles,
} from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

interface ViewPostModalProps {
  homePost: PostDetails;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
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

const ViewPostModal: React.FC<ViewPostModalProps> = ({
  homePost,
  isOpen,
  setIsOpen,
}) => {
  const { user } = useUserStore();
  const [comment, setComment] = useState<string>("");
  const { mutate: mutateCreateComment } = useCreateComment();
  const { data, isLoading } = useGetComments(homePost.id);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const {
    setComments,
    commentsByPostId,
    addNewComments,
    addOldComments,
    setReplies,
  } = useCommentStore();
  const { updatePost } = usePostStore();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const hasFetchedComments = useRef(false);

  useEffect(() => {
    if (!hasFetchedComments.current && data?.data) {
      setComments(homePost.id, data.data);
      setNextCursor(data.nextCursor ?? null);
      hasFetchedComments.current = true;
    }
  }, [data, homePost.id, setComments]);

  const handleGetNewComments = async () => {
    if (!nextCursor) return;

    setIsFetching(true);

    try {
      const res = await getComments(homePost.id, { after: nextCursor });

      if (res && res?.data) {
        if (res?.data?.length) {
          addOldComments(homePost.id, res?.data);
        }

        setNextCursor(res?.nextCursor ? res.nextCursor : null);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = () => {
    if (comment?.trim() === "") return;

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
      post_id: homePost.id,
    };

    mutateCreateComment(createCommentDto, {
      onSuccess: (data: { post: PostDetails; comments: GroupedComment[] }) => {
        if (data) {
          if (data?.post) {
            updatePost(homePost.id, data?.post);
          }

          if (data?.comments) {
            data?.comments.forEach((comment) =>
              addNewComments(homePost.id, comment),
            );
          }
        }

        setComment("");
      },
    });
  };

  return (
    <>
      {user && (
        <>
          <Modal
            backdrop="opaque"
            isOpen={isOpen}
            size="2xl"
            placement="center"
            shouldBlockScroll={false}
            isKeyboardDismissDisabled={false}
            isDismissable={false}
            motionProps={{
              variants: {
                enter: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                },
                exit: {
                  y: -20,
                  opacity: 0,
                  transition: {
                    duration: 0.2,
                    ease: "easeIn",
                  },
                },
              },
            }}
            onOpenChange={() => {
              setIsOpen(!isOpen);

              if (commentsByPostId[homePost.id]?.length) {
                commentsByPostId[homePost.id]?.forEach((c) =>
                  setReplies(c.id, []),
                );
              }
            }}
          >
            <ModalContent className="md:py-3 py-2">
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-1 text-center">
                    {homePost.user.profile.first_name +
                      " " +
                      homePost.user.profile.last_name}
                    &apos;s Post
                  </ModalHeader>

                  <Divider />

                  <ModalBody className="px-3">
                    <ScrollShadow
                      className="max-h-[500px] pr-1 max-w-full overflow-x-hidden"
                      offset={0}
                      size={0}
                    >
                      <div className="flex flex-col">
                        <PostHeader
                          homePost={homePost}
                          shouldHiddenXCloseIcon
                        />
                        <PostContent homePost={homePost} />
                        <PostOptions post={homePost} />
                      </div>

                      <Divider />

                      {isLoading ? (
                        <>
                          <div
                            className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
        flex-col items-center justify-center text-center"
                          >
                            <Spinner />

                            <p>Loading...</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col md:gap-3 gap-2">
                          {commentsByPostId[homePost.id]?.length > 0 ? (
                            <>
                              <div className="mt-6 flex flex-col md:gap-2 gap-1">
                                {commentsByPostId[`${homePost.id}`]?.map(
                                  (comment) => (
                                    <CommentItem
                                      post={homePost}
                                      key={comment.id}
                                      comment={comment}
                                    />
                                  ),
                                )}

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
                                  className="text-xs text-end hover:underline 
                                  hover:text-blue-600 cursor-pointer transition-all"
                                  onClick={handleGetNewComments}
                                >
                                  See more comments
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <div
                                className="flex flex-col md:gap-1 md:mt-6 md:mb-3
                              mt-3 mb-2 text-center items-center"
                              >
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                                  No comments yet
                                </h1>

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Be the first to share your thoughts and start
                                  the conversation.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </ScrollShadow>

                    <div className="flex md:gap-3 gap-2">
                      <Avatar
                        src={user.profile.avatar_url}
                        className="rounded-full w-10 h-10 select-none"
                      />

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
                          <div className="flex gap-2">
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
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
};

export default ViewPostModal;
