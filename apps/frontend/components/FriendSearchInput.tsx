"use client";
import { getFriendsList } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { Input } from "@heroui/react";
import { debounce } from "lodash";
import { Ellipsis, SearchIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

interface FriendSearchInputProps {
  setMode: (mode: "default" | "search") => void;
}

const FriendSearchInput: React.FC<FriendSearchInputProps> = ({ setMode }) => {
  const [query, setQuery] = useState<string>("");
  const { setFriends, viewedUser, user } = useUserStore();

  const handleSearch = useCallback(
    async (value: string) => {
      setMode("search");

      const res = await getFriendsList({
        username:
          viewedUser?.id !== user?.id
            ? (viewedUser?.profile.username ?? "")
            : (user?.profile.username ?? ""),
        ...(value.trim() !== "" && { full_name: value }),
      });

      if (res?.data) setFriends(res.data);
    },
    [viewedUser, user, setMode, setFriends],
  );

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="md:w-[300px] w-full flex items-center md:gap-2 gap-1">
      <Input
        startContent={<SearchIcon />}
        placeholder="Search your friend's name..."
        value={query}
        onChange={handleChange}
      />

      <Ellipsis />
    </div>
  );
};

export default FriendSearchInput;
