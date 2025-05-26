"use client";
import { useGetPostLikes, useInfiniteScroll } from "@/hooks";
import { getPostLikes } from "@/lib/api/posts";
import { PostDetails } from "@/store";
import { formatDateTime, LikedUserType } from "@/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Spinner,
  User,
} from "@heroui/react";
import React, { useEffect, useState } from "react";

interface ViewLikedUsersDetailModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: PostDetails;
}

const ViewLikedUsersDetaiModal: React.FC<ViewLikedUsersDetailModalProps> = ({
  isOpen,
  setIsOpen,
  post,
}) => {
  const { data, isLoading: isLoadingPostLiked } = useGetPostLikes(post.id);
  const [likedUsers, setLikedUsers] = useState<LikedUserType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setLikedUsers(data.data);
      setNextCursor(data?.nextCursor);
    }
  }, [data, setLikedUsers, setNextCursor]);

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);

    try {
      const res = await getPostLikes(post.id, {
        after: nextCursor,
      });

      if (res && res?.data) {
        setLikedUsers((prev) => [...prev, ...res.data]);
        setNextCursor(res?.nextCursor);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      placement="center"
      size="lg"
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
      onOpenChange={() => setIsOpen(!isOpen)}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              People who liked{" "}
              {post.user.profile.first_name + " " + post.user.profile.last_name}
              &apos;s post
            </ModalHeader>
            <ModalBody>
              <ScrollShadow
                className="max-h-[350px]"
                hideScrollBar
                size={0}
                offset={0}
              >
                {(isLoading || isLoadingPostLiked) && (
                  <div
                    className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
        flex-col items-center justify-center text-center"
                  >
                    <Spinner />

                    <p>Loading...</p>
                  </div>
                )}

                {likedUsers?.length !== 0 && (
                  <div className="flex flex-col md:gap-2 gap-1">
                    {likedUsers.map((lu, index) => (
                      <div
                        key={lu.id}
                        ref={
                          index === likedUsers.length - 1 ? lastPostRef : null
                        }
                      >
                        <User
                          avatarProps={{
                            src: `${lu.avatar_url}`,
                          }}
                          className="select-none"
                          description={formatDateTime(lu.liked_at)}
                          name={lu.full_name}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollShadow>
            </ModalBody>

            <ModalFooter className="flex items-center justify-center text-center">
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewLikedUsersDetaiModal;
