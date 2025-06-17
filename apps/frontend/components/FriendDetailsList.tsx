"use client";
import FriendCardList from "@/components/FriendCardList";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfiniteScroll } from "@/hooks";
import { getFriendsList } from "@/lib/api/users";
import { useFriendStore, useUserStore } from "@/store";
import { Friend, FriendListType, handleAxiosError } from "@/utils";
import { Input } from "@heroui/react";
import { debounce } from "lodash";
import { SearchIcon, Users } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface FriendDetailsListProps {
  data: { data: Friend[]; nextCursor?: string };
  isLoading: boolean;
}

const FriendDetailsList: React.FC<FriendDetailsListProps> = ({
  data,
  isLoading,
}) => {
  const { user } = useUserStore();
  const { setFriends, friends, addFriends } = useFriendStore();
  const [mode, setMode] = useState<"default" | "search">("default");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setFriends(data?.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setFriends, setNextCursor]);

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getFriendsList({
        username: user?.profile?.username ?? "",
        type: FriendListType.FRIENDS,
        after: nextCursor,
      });

      if (res?.data) addFriends(res.data);

      setNextCursor(res?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const handleSearch = useCallback(
    async (value: string) => {
      if (isSearching) return;

      setIsSearching(true);

      setMode("search");

      try {
        const res = await getFriendsList({
          username: user?.profile?.username ?? "",
          ...(value.trim() !== "" && { full_name: value }),
          type: FriendListType.FRIENDS,
        });

        if (res?.data) setFriends(res.data);
      } catch (error) {
        handleAxiosError(error);
      } finally {
        setIsSearching(false);
      }
    },
    [user, setMode, setFriends, setIsSearching, isSearching],
  );

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value?.trim() && !friends.length) setIsSearching(false);
    setQuery(value);
    debouncedSearch(value);
  };

  const lastFriendRef = useInfiniteScroll(loadMore, !!nextCursor);

  if (isLoading) return <PrimaryLoading />;

  if (!isLoading && !friends.length && mode === "default")
    return (
      <div className="text-center text-gray-500 mt-4 flex flex-col items-center gap-2">
        <Users className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold">No friends yet</p>
        <p className="text-sm">
          Start connecting with people to see them here.
        </p>
      </div>
    );

  return (
    <section className="flex flex-col md:gap-3 gap-2">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Your Friends</h1>
        <p className="text-gray-500 text-sm">
          View and manage your friend list.
        </p>
      </div>

      <div className="flex items-center md:gap-3 gap-2 md:max-w-xl w-full">
        <Input
          startContent={<SearchIcon />}
          placeholder="Search your friend's name..."
          value={query}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:gap-3 gap-2 p-4 border-t border-t-black/10">
        {isSearching ? (
          <PrimaryLoading />
        ) : (
          <ScrollArea className="h-[400px] pr-3">
            <FriendCardList
              friends={friends}
              lastFriendRef={lastFriendRef}
              hasMore={hasMore}
              isSearching={mode === "search"}
              setIsSearching={setIsSearching}
            />
          </ScrollArea>
        )}
      </div>
    </section>
  );
};

export default FriendDetailsList;
