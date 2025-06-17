"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfiniteScroll, useResponseToFriendRequest } from "@/hooks";
import { getFriendRequests } from "@/lib/api/users";
import { useUserStore } from "@/store";
import {
  FriendRequestsType,
  handleAxiosError,
  RelationshipType,
  ResponseFriendRequestAction,
  ResponseFriendRequestType,
} from "@/utils";
import { Avatar, Button } from "@heroui/react";
import { UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FriendRequestListProps {
  data: { data: FriendRequestsType[]; nextCursor?: string };
  isLoading: boolean;
}

const FriendRequestsList: React.FC<FriendRequestListProps> = ({
  data,
  isLoading,
}) => {
  const { user, setUser } = useUserStore();
  const [friendRequests, setFriendRequests] = useState<FriendRequestsType[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { mutate: mutateResponseToFriendRequest } =
    useResponseToFriendRequest();

  useEffect(() => {
    if (data) {
      setFriendRequests(data?.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setFriendRequests, setNextCursor]);

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getFriendRequests({
        after: nextCursor,
      });

      if (res?.data) setFriendRequests((prev) => [...prev, ...res.data]);

      setNextCursor(res?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const responseToFriendRequest = async (
    action: ResponseFriendRequestAction,
    request: FriendRequestsType,
  ) => {
    if (!user?.id) return;

    const responseToFriendRequestDto: ResponseFriendRequestType = {
      action,
      initiator_id: request.initiator_id,
    };

    mutateResponseToFriendRequest(responseToFriendRequestDto, {
      onSuccess: (data: RelationshipType, variables) => {
        if (data) {
          const { action } = variables;
          if (action === ResponseFriendRequestAction.ACCEPT) {
            toast.success(
              `You are now friends with ${request.initiator.full_name}!`,
              {
                position: "bottom-right",
              },
            );
            setUser({
              ...user,
              total_friends: user.total_friends + 1,
            });
          } else if (action === ResponseFriendRequestAction.REJECT) {
            toast.success(
              `You have declined the friend request from ${request.initiator.full_name}.`,
              {
                position: "bottom-right",
              },
            );
          }
          setFriendRequests((prev) =>
            prev.filter((r) => r.initiator_id !== request.initiator_id),
          );
        }
      },
    });
  };

  const lastFriendRef = useInfiniteScroll(loadMore, !!nextCursor);

  if (isLoading) return <PrimaryLoading />;

  if (!isLoading && !friendRequests.length) {
    return (
      <div className="text-center text-gray-500 mt-4 flex flex-col items-center gap-2">
        <UserPlus className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold">No friend requests</p>
        <p className="text-sm">
          When someone sends you a friend request, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <section className="relative flex flex-col md:gap-4 gap-3">
      <div className="flex flex-col relative mb-2">
        <h1 className="text-xl font-bold">Who&apos;s trying to connect?</h1>
        <p className="text-gray-500 text-sm">
          Respond to incoming friend requests here.
        </p>
      </div>

      <ScrollArea className="h-[450px] relative">
        <div
          className="p-3 max-w-5xl mx-auto border-t border-t-black/10 flex flex-col
            md:gap-2 gap-1"
        >
          {friendRequests.map((fr, index) => (
            <div
              key={fr.initiator_id + "-" + user?.id}
              className="flex items-center justify-between
                  p-3 rounded-md hover:bg-gray-100 cursor-pointer"
              ref={index === friendRequests.length - 1 ? lastFriendRef : null}
            >
              <div className="flex items-center md:gap-2 gap-1">
                <Avatar
                  src={fr.initiator.avatar_url}
                  alt={fr.initiator.full_name}
                  className="w-10 h-10 select-none rounded-full flex-shrink-0"
                />

                <div className="flex flex-col relative">
                  <span className="text-sm font-medium">
                    {fr.initiator.full_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    @{fr.initiator.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center md:gap-2 gap-1">
                <Button
                  color="danger"
                  onPress={() =>
                    responseToFriendRequest(
                      ResponseFriendRequestAction.REJECT,
                      fr,
                    )
                  }
                >
                  Delete
                </Button>
                <Button
                  color="success"
                  className="text-white"
                  onPress={() =>
                    responseToFriendRequest(
                      ResponseFriendRequestAction.ACCEPT,
                      fr,
                    )
                  }
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default FriendRequestsList;
