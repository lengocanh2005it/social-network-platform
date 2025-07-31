"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import CommentItem from "@/components/post/CommentItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeleteComment } from "@/hooks";
import { getComments } from "@/lib/api/posts";
import { PostDetails, useCommentStore, useUserStore } from "@/store";
import { handleAxiosError } from "@/utils";
import {
  Button as ButtonHeroUI,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { RoleEnum } from "@repo/db";
import { MessageCircle } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface ViewUserCommentsModalProps {
  post: PostDetails;
  setPosts: React.Dispatch<React.SetStateAction<PostDetails[]>>;
}

const ViewUserCommentsModal: React.FC<ViewUserCommentsModalProps> = ({
  post,
  setPosts,
}) => {
  const { user } = useUserStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { setComments, commentsByPostId, addOldComments } = useCommentStore();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { mutate: mutateDeleteComment } = useDeleteComment();

  const handleGetComments = async () => {
    setIsLoading(true);
    try {
      const response = await getComments(post.id);
      if (response) {
        setComments(post.id, response?.data ?? []);
        setNextCursor(response.nextCursor ?? null);
      }
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (post.total_comments > 0) {
      onOpen();
      await handleGetComments();
    }
  };

  const handleGetNewComments = async () => {
    if (!nextCursor || hasMore) return;
    setHasMore(true);

    try {
      const response = await getComments(post.id, {
        after: nextCursor,
      });

      if (response) {
        addOldComments(post.id, response.data ?? []);
        setNextCursor(response?.nextCursor ?? null);
      }
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
        onSuccess: (data) => {
          if (data) {
            setComments(
              post.id,
              commentsByPostId[post.id].filter((c) => c.id !== commentId),
            );

            setPosts((prev) =>
              prev.map((p) => {
                if (p.id === post.id) {
                  return {
                    ...p,
                    total_comments: p.total_comments - 1,
                  };
                }
                return p;
              }),
            );

            if (commentsByPostId[post.id].length - 1 <= 2 && nextCursor) {
              setTimeout(() => {
                handleGetNewComments();
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
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleClick}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{post.total_comments}</span>
      </Button>

      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        placement="center"
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
        onOpenChange={onOpenChange}
        size="xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                People who commented{" "}
                {post.user.profile.first_name +
                  " " +
                  post.user.profile.last_name}
                &apos;s post
              </ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <PrimaryLoading />
                ) : (
                  <>
                    {commentsByPostId[post.id]?.length > 0 ? (
                      <>
                        <ScrollArea
                          className="h-[300px] relative border-t
                        border-black/10 pt-2"
                        >
                          <div className="flex flex-col md:gap-2 gap-1">
                            {commentsByPostId[post.id]?.map((comment) => (
                              <CommentItem
                                key={comment.id}
                                post={post}
                                comment={comment}
                                shouldHideCommentButton={
                                  user?.role === RoleEnum.admin
                                }
                                shouldHideLikeButton={
                                  user?.role === RoleEnum.admin
                                }
                                onDelete={() => handleDeleteComment(comment.id)}
                              />
                            ))}

                            {hasMore && <PrimaryLoading />}
                          </div>

                          {nextCursor && !hasMore && (
                            <p
                              className="text-xs text-end hover:underline hover:text-blue-600
                             cursor-pointer transition-all pr-3 dark:hover:text-blue-700"
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

                          <p className="text-sm text-gray-500 dark:text-white/70">
                            The post currently has no comments.
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter className="flex items-center justify-center text-center">
                <ButtonHeroUI color="primary" onPress={onClose}>
                  Close
                </ButtonHeroUI>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewUserCommentsModal;
