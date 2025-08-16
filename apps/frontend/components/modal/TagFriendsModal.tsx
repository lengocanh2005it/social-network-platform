"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetFriendsList, useInfiniteScroll } from "@/hooks";
import { getTaggedUsersOfPost } from "@/lib/api/posts";
import { getFriendsList } from "@/lib/api/users";
import { PostDetails, useUserStore } from "@/store";
import { Friend, FriendListType } from "@/utils";
import {
  Avatar,
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import React, { useEffect, useRef, useState } from "react";

interface TagFriendsModalProps {
  isShowTagPeopleModal: boolean;
  setIsShowTagPeopleModal: (isShowTagPeopleModal: boolean) => void;
  post?: PostDetails;
}

const TagFriendsModal: React.FC<TagFriendsModalProps> = ({
  isShowTagPeopleModal,
  setIsShowTagPeopleModal,
  post,
}) => {
  const {
    user,
    selectedTaggedUsers,
    setSelectedTaggedUsers,
    setOriginalTaggedUsers,
    tempSelectedTaggedUsers,
    setTempSelectedTaggedUsers,
    setTotalTaggedUsers,
  } = useUserStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const { data, isLoading } = useGetFriendsList(user?.id ?? "", {
    username: user?.profile?.username ?? "",
    type: FriendListType.FRIENDS,
  });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [taggedUsersNextCursor, setTaggedUsersNextCursor] = useState<
    string | null
  >(null);
  const nextCursorRef = useRef<string | null>(nextCursor);
  const tempSelectedTaggedUsersRef = useRef<Friend[]>(tempSelectedTaggedUsers);
  const [scrollClick, setScrollClick] = useState<boolean>(false);

  const handleSelect = (friend: Friend, checked: boolean) => {
    if (checked) {
      setTempSelectedTaggedUsers([...tempSelectedTaggedUsers, friend]);
    } else {
      setTempSelectedTaggedUsers(
        tempSelectedTaggedUsers.filter((u) => u.user_id !== friend.user_id),
      );
    }
  };

  useEffect(() => {
    if (post?.tagged_users?.nextCursor)
      setTaggedUsersNextCursor(post.tagged_users.nextCursor);
  }, [post, setTaggedUsersNextCursor]);

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  useEffect(() => {
    if (isShowTagPeopleModal) {
      setTempSelectedTaggedUsers(selectedTaggedUsers);
    }
  }, [isShowTagPeopleModal, setTempSelectedTaggedUsers, selectedTaggedUsers]);

  useEffect(() => {
    if (data?.data) {
      setFriends(data.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setFriends, setNextCursor]);

  const handleOpenChange = () => {
    setIsShowTagPeopleModal(!isShowTagPeopleModal);
    setOriginalTaggedUsers([]);
    setTempSelectedTaggedUsers([]);
  };

  const handleClick = async () => {
    while (nextCursorRef.current) {
      await loadMore();
    }
    setTotalTaggedUsers(tempSelectedTaggedUsersRef.current.length);
    setSelectedTaggedUsers(tempSelectedTaggedUsersRef.current);
    setIsShowTagPeopleModal(false);
  };

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);
    setScrollClick(true);

    try {
      const res = await getFriendsList({
        username: user?.profile?.username ?? "",
        type: FriendListType.FRIENDS,
        after: nextCursor,
      });

      if (res && res?.data) {
        if (taggedUsersNextCursor && post) {
          const res1 = await getTaggedUsersOfPost(post.id, {
            after: taggedUsersNextCursor,
          });

          const existingIds = new Set(
            selectedTaggedUsers.map((u) => u.user_id),
          );
          const newUsers = res1.data.filter(
            (u: Friend) => !existingIds.has(u.user_id),
          );

          setTempSelectedTaggedUsers((prev) => [...prev, ...newUsers]);
          setOriginalTaggedUsers((prev) => [...prev, ...newUsers]);
          setTaggedUsersNextCursor(res1?.nextCursor ?? null);
        }

        setFriends((prev) => [...prev, ...res.data]);
        const next = res?.nextCursor ?? null;
        setNextCursor(next);
        nextCursorRef.current = next;
      }
    } finally {
      setHasMore(false);
      setScrollClick(false);
    }
  };

  useEffect(() => {
    tempSelectedTaggedUsersRef.current = tempSelectedTaggedUsers;
  }, [tempSelectedTaggedUsers]);

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <Modal
      backdrop="opaque"
      isOpen={isShowTagPeopleModal}
      placement="center"
      shouldBlockScroll={false}
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
      onOpenChange={handleOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Tag people
              <p className="text-sm text-gray-700 dark:text-white/70 font-normal">
                Select friends to tag in your post.
              </p>
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <PrimaryLoading />
              ) : (
                <>
                  {friends.length > 0 ? (
                    <>
                      <ScrollArea
                        className="h-[200px] border-b border-b-black/10
                      dark:border-b-white/20"
                      >
                        <div
                          className="relative flex flex-col md:gap-2 gap-1 border-t 
                      border-t-black/10 dark:border-t-white/20 p-2 py-3 cursor-pointer"
                        >
                          {friends.map((friend, index) => {
                            const isSelected = tempSelectedTaggedUsers
                              .map((u) => u.user_id)
                              .includes(friend.user_id);

                            const handleWrapperClick = () => {
                              handleSelect(friend, !isSelected);
                            };

                            return (
                              <div
                                key={friend.user_id}
                                className="flex items-center p-2 rounded-md hover:bg-gray-100 
                              cursor-pointer dark:hover:bg-white/20"
                                onClick={handleWrapperClick}
                                ref={
                                  index === friends.length - 1
                                    ? lastPostRef
                                    : null
                                }
                              >
                                <Checkbox
                                  defaultChecked={isSelected}
                                  isSelected={isSelected}
                                  onValueChange={(checked: boolean) =>
                                    handleSelect(friend, checked)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />

                                <div className="flex items-center gap-1">
                                  <Avatar
                                    src={friend.avatar_url}
                                    alt={friend.full_name}
                                    className="select-none w-10 h-10 flex-shrink-0"
                                  />

                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {friend.full_name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-white/70">
                                      @{friend.username}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {hasMore && <PrimaryLoading />}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-6 
                    text-center text-gray-500 dark:text-white/70"
                    >
                      <h1 className="text-lg font-semibold">
                        No friends to show
                      </h1>

                      <p className="text-sm mt-2">
                        You have no friends available to tag right now.
                      </p>
                    </div>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter
              className="flex items-center justify-center md:gap-2 gap-1
             text-center relative"
            >
              <Button
                color="primary"
                onPress={() => {
                  onClose();
                  setOriginalTaggedUsers([]);
                  setTempSelectedTaggedUsers([]);
                }}
              >
                Close
              </Button>

              {scrollClick ? (
                <Button color="primary" isLoading>
                  Please wait...
                </Button>
              ) : (
                <Button color="primary" onPress={handleClick}>
                  Submit
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TagFriendsModal;
