"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfiniteScroll } from "@/hooks";
import { getSharesOfPost } from "@/lib/api/admin";
import { PostDetails } from "@/store";
import { handleAxiosError } from "@/utils";
import {
  Avatar,
  Button as ButtonHeroUI,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ViewUserSharesModalProps {
  post: PostDetails;
}

const ViewUserSharesModal: React.FC<ViewUserSharesModalProps> = ({ post }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [childrenPosts, setChildrenPosts] = useState<PostDetails[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const router = useRouter();

  const handleGetShares = async () => {
    setIsLoading(true);
    try {
      const response = await getSharesOfPost(post.id, {});

      if (response) {
        setChildrenPosts(response?.data ?? []);
        setNextCursor(response?.nextCursor ?? null);
      }
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (post.total_shares > 0) {
      onOpen();
      await handleGetShares();
    }
  };

  const handleGetNewShares = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const response = await getSharesOfPost(post.id, {
        after: nextCursor,
      });

      setChildrenPosts((prev) => [...prev, ...response.data]);
      setNextCursor(response?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const handleViewProfile = (username: string) =>
    router.push(`/dashboard/users/${username}`);

  const lastPostRef = useInfiniteScroll(handleGetNewShares, !!nextCursor);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleClick}
      >
        <Share2 className="h-4 w-4" />
        <span>{post.total_shares}</span>
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
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                People who shared{" "}
                {post.user.profile.first_name +
                  " " +
                  post.user.profile.last_name}
                &apos;s post
              </ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <>
                    <PrimaryLoading />
                  </>
                ) : (
                  <>
                    {childrenPosts?.length > 0 ? (
                      <>
                        <ScrollArea
                          className="h-[300px] relative border-t
                        border-black/10"
                        >
                          <div className="relative flex flex-col md:gap-3 gap-2 md:px-4 px-3">
                            {childrenPosts.map((cp, index) => (
                              <div
                                key={cp.id}
                                className="flex items-center md:gap-2 gap-1
                                p-2 hover:bg-gray-400 dark:hover:bg-white/20 rounded-lg
                                cursor-pointer"
                                ref={
                                  index === childrenPosts.length - 1
                                    ? lastPostRef
                                    : null
                                }
                              >
                                <Avatar
                                  src={cp.user.profile.avatar_url}
                                  alt={
                                    cp.user.profile.first_name +
                                    " " +
                                    cp.user.profile.last_name
                                  }
                                  className="w-10 h-10 select-none rounded-full flex-shrink-0"
                                  onClick={() =>
                                    handleViewProfile(cp.user.profile.username)
                                  }
                                />

                                <div className="relative space-y-1">
                                  <p>
                                    {cp.user.profile.first_name +
                                      " " +
                                      cp.user.profile.last_name}
                                  </p>

                                  <p className="text-xs text-black/70 dark:text-white/80">
                                    @{cp.user.profile.username} •{" "}
                                    {formatDistanceToNow(
                                      new Date(cp.created_at),
                                      {
                                        addSuffix: true,
                                      },
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {hasMore && <PrimaryLoading />}
                        </ScrollArea>
                      </>
                    ) : (
                      <></>
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

export default ViewUserSharesModal;
