"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfiniteScroll } from "@/hooks";
import { getTaggedUsersOfPost } from "@/lib/api/posts";
import { PostDetails } from "@/store";
import { handleAxiosError, TaggedUserType } from "@/utils";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "@heroui/react";
import { EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ViewTaggedUsersModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: PostDetails;
}

const ViewTaggedUsersModal: React.FC<ViewTaggedUsersModalProps> = ({
  isOpen,
  setIsOpen,
  post,
}) => {
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [taggedUsers, setTaggedUsers] = useState<TaggedUserType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const router = useRouter();

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getTaggedUsersOfPost(post.id, {
        after: nextCursor,
      });

      if (res?.data) setTaggedUsers((prev) => [...prev, ...res.data]);
      setNextCursor(res?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (post?.tagged_users?.data) setTaggedUsers(post.tagged_users.data);
    if (post?.tagged_users?.nextCursor)
      setNextCursor(post.tagged_users.nextCursor);
  }, [post, setNextCursor, setTaggedUsers]);

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      shouldBlockScroll={false}
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
      onOpenChange={() => setIsOpen(!isOpen)}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center justify-center text-center">
              Tagged Users
              <p className="text-sm text-gray-700 font-normal">
                These users were mentioned in this post.
              </p>
            </ModalHeader>
            <ModalBody>
              <ScrollArea className="h-[300px] border-t border-t-black/10">
                <div className="relative flex flex-col md:gap-2 gap-1 p-2 px-3">
                  {taggedUsers.slice(1).map((su, index) => (
                    <div
                      key={su.user_id}
                      className="relative p-2 rounded-md hover:bg-gray-100
                    cursor-pointer flex items-center md:gap-2 gap-1 justify-between"
                      ref={
                        index === taggedUsers.slice(1).length - 1
                          ? lastPostRef
                          : null
                      }
                    >
                      <div className="flex items-center md:gap-2 gap-1">
                        <Avatar
                          src={su.avatar_url}
                          alt={su.full_name}
                          className="w-10 h-10 select-none rounded-full flex-shrink-0 cursor-pointer"
                        />

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {su.full_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{su.username}
                          </span>
                        </div>
                      </div>

                      <Tooltip content="View Profile">
                        <EyeIcon
                          className="cursor-pointer focus:outline-none 
                      opacity-70 hover:opacity-100"
                          onClick={() => handleViewProfile(su.username)}
                        />
                      </Tooltip>
                    </div>
                  ))}

                  {hasMore && <PrimaryLoading />}
                </div>
              </ScrollArea>
            </ModalBody>
            <ModalFooter className="flex items-center justify-center mx-auto text-center">
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

export default ViewTaggedUsersModal;
