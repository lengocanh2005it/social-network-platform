"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tooltip,
  Avatar,
  ScrollShadow,
} from "@heroui/react";
import { CommentLikedType, formatDateTime, GroupedComment } from "@/utils";
import { PostDetails } from "@/store";
import { getLikesOfComment } from "@/lib/api/posts";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useInfiniteScroll } from "@/hooks";

interface ViewCommentLikedDetailsModalProps {
  comment: GroupedComment;
  post: PostDetails;
}

const ViewCommentLikedDetailsModal: React.FC<
  ViewCommentLikedDetailsModalProps
> = ({ comment, post }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [likedUsers, setLikedUsers] = useState<CommentLikedType[]>([]);
  const [hasLoadMore, setHasLoadMore] = useState<boolean>(false);

  const handleGetCommenLikesDetails = async () => {
    setIsLoading(true);

    onOpen();

    const params = nextCursor ? { after: nextCursor } : undefined;

    try {
      const data = await getLikesOfComment(post.id, comment.id, params);

      if (data?.data) {
        setLikedUsers(data.data);
      }

      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;

    setHasLoadMore(true);

    try {
      const res = await getLikesOfComment(post.id, comment.id, {
        after: nextCursor,
      });

      if (res && res?.data) {
        setLikedUsers((prev) => [...prev, ...res.data]);
      }

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } finally {
      setHasLoadMore(false);
    }
  };

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <>
      <Tooltip content="Click to see who liked this comment">
        <div
          className="absolute bottom-0 -right-4 cursor-pointer bg-blue-500
          text-white text-[13px] h-6 px-2 flex items-center gap-[2px]
            justify-center rounded-full"
          onClick={handleGetCommenLikesDetails}
        >
          <span>👍</span>
          <span>{comment.total_likes}</span>
        </div>
      </Tooltip>

      <Modal
        backdrop="opaque"
        placement="center"
        shouldBlockScroll={false}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        size="lg"
        isOpen={isOpen}
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
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                People who liked {comment.user.full_name}
                &apos;s comment
              </ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <PrimaryLoading />
                ) : (
                  <>
                    {likedUsers?.length > 0 && (
                      <>
                        <ScrollShadow
                          className="max-h-[350px]"
                          hideScrollBar
                          size={0}
                          offset={0}
                        >
                          <div className="flex flex-col md:gap-2 gap-1">
                            {likedUsers.map((user, index) => (
                              <div
                                key={user.id}
                                ref={
                                  index === likedUsers.length - 1
                                    ? lastPostRef
                                    : null
                                }
                                className="flex items-center md:gap-3 gap-2"
                              >
                                <Avatar
                                  src={user.user.avatar_url}
                                  alt={user.user.full_name}
                                  className="select-none"
                                />

                                <div className="flex flex-col">
                                  <h1 className="font-semibold">
                                    {user.user.full_name}
                                  </h1>

                                  <p className="text-sm text-gray-700 dark:text-white/90">
                                    {formatDateTime(user.liked_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {hasLoadMore && <PrimaryLoading />}
                        </ScrollShadow>
                      </>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter className="flex flex-col items-center justify-center">
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewCommentLikedDetailsModal;
