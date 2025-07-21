"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useGetFriendRequests, useResponseToFriendRequest } from "@/hooks";
import { getFriendRequests } from "@/lib/api/users";
import { useUserStore } from "@/store";
import {
  FriendRequestsType,
  RelationshipType,
  ResponseFriendRequestAction,
  ResponseFriendRequestType,
} from "@/utils";
import { Button, ScrollShadow, Tooltip, User } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FriendRequests: React.FC = () => {
  const { user, setUser } = useUserStore();
  const [friendRequests, setFriendRequests] = useState<FriendRequestsType[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasLoadMore, setHasLoadMore] = useState<boolean>(false);
  const { data, isLoading } = useGetFriendRequests(user?.id ?? "");
  const { mutate: mutateResponseToFriendRequest } =
    useResponseToFriendRequest();
  const router = useRouter();

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  useEffect(() => {
    if (data && data?.data) {
      setFriendRequests(data?.data);

      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    }
  }, [data, setNextCursor, setFriendRequests]);

  const handleLoadMore = async () => {
    if (!nextCursor || !user?.id) return;

    setHasLoadMore(true);

    try {
      const res = await getFriendRequests({ after: nextCursor });

      if (res?.data) {
        setFriendRequests((prev) => [...prev, ...res.data]);
      }

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } finally {
      setHasLoadMore(false);
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

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h2 className="text-medium font-medium text-black/70 dark:text-white/70">
          Friend Requests
        </h2>

        {friendRequests?.length !== 0 && (
          <Link
            href={"/friends/?tab=requests"}
            className="text-blue-600 hover:underline"
          >
            See all
          </Link>
        )}
      </div>

      {isLoading ? (
        <PrimaryLoading />
      ) : (
        <>
          {friendRequests?.length !== 0 ? (
            <ScrollShadow
              className="max-h-[250px] flex flex-col md:gap-2 gap-1 relative"
              offset={0}
              size={0}
            >
              {friendRequests.map((request) => (
                <div
                  key={request.initiator_id + "-" + user?.id}
                  className="flex items-center md:gap-2 gap-1 
                justify-between hover:bg-gray-100 p-2 rounded-lg pr-0"
                >
                  <div className="flex items-center gap-3 w-1/2">
                    <Tooltip content={request.initiator.full_name} delay={3000}>
                      <User
                        avatarProps={{
                          src: request.initiator.avatar_url,
                        }}
                        name={
                          <span className="block max-w-[80px] truncate text-sm font-medium">
                            {request.initiator.full_name}
                          </span>
                        }
                        className="cursor-pointer select-none"
                        onClick={() =>
                          handleViewProfile(request.initiator.username)
                        }
                      />
                    </Tooltip>
                  </div>

                  <div className="flex gap-1 w-2/3">
                    <Button
                      className="bg-blue-500 text-white text-xs rounded-medium 
                  hover:bg-blue-700 transition"
                      onPress={() =>
                        responseToFriendRequest(
                          ResponseFriendRequestAction.ACCEPT,
                          request,
                        )
                      }
                    >
                      Confirm
                    </Button>

                    <Button
                      className="bg-gray-200 text-xs rounded-medium
                  hover:bg-gray-300 transition"
                      onPress={() =>
                        responseToFriendRequest(
                          ResponseFriendRequestAction.REJECT,
                          request,
                        )
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {hasLoadMore && <PrimaryLoading />}

              {nextCursor && (
                <p
                  className="text-right text-xs hover:underline cursor-pointer"
                  onClick={handleLoadMore}
                >
                  See more requests
                </p>
              )}
            </ScrollShadow>
          ) : (
            <>
              {!isLoading && (
                <div
                  className="flex md:mt-6 md:mb-6 mt-4 flex-col text-sm 
                items-center justify-center text-center"
                >
                  <h1>No Friend Requests</h1>

                  <p className="text-xs">
                    You have no pending friend requests at the moment.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FriendRequests;
