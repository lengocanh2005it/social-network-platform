"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateFriendRequest, useInfiniteScroll } from "@/hooks";
import { getFriendsList } from "@/lib/api/users";
import { useUserStore } from "@/store";
import {
  CreateFriendRequestType,
  FriendListType,
  FriendSuggestionType,
  handleAxiosError,
  RelationshipType,
} from "@/utils";
import { Avatar, Button } from "@heroui/react";
import { UserPlus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FriendSuggestionsListProps {
  data: { data: FriendSuggestionType[]; nextCursor?: string };
  isLoading: boolean;
}

const FriendSuggestionsList: React.FC<FriendSuggestionsListProps> = ({
  data,
  isLoading,
}) => {
  const { user, setRelationship } = useUserStore();
  const [friendSuggestions, setFriendSuggestions] = useState<
    FriendSuggestionType[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { mutate: mutateCreateFriendRequest } = useCreateFriendRequest();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setFriendSuggestions(data?.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setFriendSuggestions, setNextCursor]);

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getFriendsList({
        username: user?.profile?.username ?? "",
        type: FriendListType.SUGGESTIONS,
        after: nextCursor,
      });

      if (res?.data) setFriendSuggestions((prev) => [...prev, ...res.data]);

      setNextCursor(res?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const handleAddNewFriendClick = (friend: FriendSuggestionType) => {
    if (!friend?.user_id) return;

    const createFriendRequestDto: CreateFriendRequestType = {
      target_id: friend.user_id,
    };

    setLoadingId(friend.user_id);

    mutateCreateFriendRequest(createFriendRequestDto, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success("Friend request has been sent to this user.", {
            position: "bottom-right",
          });
          setRelationship(data);
          setFriendSuggestions((prev) =>
            prev.filter((p) => p.user_id !== friend.user_id),
          );
        }
      },
      onSettled: () => {
        setLoadingId(null);
      },
    });
  };

  const lastFriendRef = useInfiniteScroll(loadMore, !!nextCursor);

  if (isLoading) return <PrimaryLoading />;

  if (!isLoading && !friendSuggestions.length)
    return (
      <div className="text-center text-gray-500 mt-4 flex flex-col items-center gap-2">
        <Users className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold">No suggestions available</p>
        <p className="text-sm">
          You&apos;ll see friend suggestions here once you start connecting with
          more people.
        </p>
      </div>
    );

  return (
    <section className="flex flex-col md:gap-3 gap-2">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Looking for new connections?</h1>
        <p className="text-gray-500 text-sm">
          Here are some people you might know.
        </p>
      </div>

      <ScrollArea className="h-[450px] relative">
        <div
          className="p-4 max-w-5xl mx-auto border-t border-t-black/10 flex flex-col
            md:gap-2 gap-1"
        >
          {friendSuggestions.map((fs, index) => (
            <div
              key={fs.user_id}
              className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-md
                    cursor-pointer"
              ref={
                index === friendSuggestions.length - 1 ? lastFriendRef : null
              }
            >
              <div className="flex items-center md:gap-2 gap-1">
                <Avatar
                  src={fs.avatar_url}
                  alt={fs.full_name}
                  className="w-10 h-10 select-none rounded-full flex-shrink-0"
                />

                <div className="flex flex-col relative">
                  <span className="text-sm font-medium">{fs.full_name}</span>
                  <span className="text-xs text-gray-500">
                    @{fs.username}{" "}
                    {fs.mutual_friends > 0 &&
                      `- ${fs.mutual_friends} mutual friends`}
                  </span>
                </div>
              </div>

              {loadingId === fs.user_id ? (
                <Button color="primary" isLoading>
                  Please wait...
                </Button>
              ) : (
                <Button
                  color="primary"
                  startContent={<UserPlus />}
                  onPress={() => handleAddNewFriendClick(fs)}
                >
                  Add new friend
                </Button>
              )}
            </div>
          ))}

          {hasMore && <PrimaryLoading />}
        </div>
      </ScrollArea>
    </section>
  );
};

export default FriendSuggestionsList;
