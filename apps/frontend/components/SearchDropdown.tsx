"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { getUsers } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { handleAxiosError, UserSearchResult } from "@/utils";
import { Input, ScrollShadow, Spinner } from "@heroui/react";
import { debounce } from "lodash";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

type HistoryItem = { id: string; name: string; type: "history" };

type SearchItem = UserSearchResult & { type: "user" };

type DropdownItem = HistoryItem | SearchItem;

const SearchDropdown: React.FC = () => {
  const { user } = useUserStore();
  const [inputValue, setInputValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showingHistory, setShowingHistory] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const router = useRouter();

  const handleLoadMore = async () => {
    if (!nextCursor || loadMore || inputValue?.trim() === "") return;

    setLoadMore(true);

    try {
      const res = await getUsers({
        full_name: inputValue,
        after: nextCursor,
      });

      if (res?.data?.length) setSearchResults((prev) => [...prev, ...res.data]);

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } catch (error) {
      handleAxiosError(error);
      return [];
    } finally {
      setLoadMore(false);
    }
  };

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return [];

    try {
      const res = await getUsers({
        full_name: query,
      });

      setNextCursor(res?.nextCursor ? res.nextCursor : null);

      return res?.data;
    } catch (error) {
      handleAxiosError(error);
      return [];
    }
  };

  const debouncedSaveHistory = useMemo(
    () =>
      debounce((value: string) => {
        if (!value.trim()) return;

        setSearchHistory((prev) => {
          const newHistory = Array.from(new Set([value.trim(), ...prev]));

          if (user?.profile?.username) {
            localStorage.setItem(
              `${user.profile.username}/search-history`,
              JSON.stringify(newHistory),
            );
          }

          return newHistory;
        });
      }, 1000),
    [user],
  );

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        const results = await fetchSearchResults(query);
        setIsLoading(false);
        if (results.length > 0) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
          debouncedSaveHistory(query);
        }
      }, 500),
    [debouncedSaveHistory],
  );
  useEffect(() => {
    if (user?.profile?.username) {
      const saved = localStorage.getItem(
        `${user.profile.username}/search-history`,
      );

      if (saved) {
        const parsed = JSON.parse(saved);
        setSearchHistory(parsed);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      debouncedSaveHistory.cancel();
    };
  }, [debouncedSearch, debouncedSaveHistory]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowDropdown(true);

    if (!value.trim()) {
      setShowingHistory(true);
      return;
    }

    setShowingHistory(false);

    setIsLoading(true);

    debouncedSearch(value);
  };

  const handleDeleteHistoryItem = (nameToDelete: string) => {
    const updated = searchHistory.filter((item) => item !== nameToDelete);

    setSearchHistory(updated);

    if (user?.profile?.username) {
      localStorage.setItem(
        `${user.profile.username}/search-history`,
        JSON.stringify(updated),
      );
    }
  };

  const handleItemSelect = (
    name: string,
    type: "history" | "user",
    full_name?: string,
  ) => {
    const value = full_name ?? name;

    setInputValue(value);
    setShowDropdown(false);

    if (type === "history") {
      handleInputChange(value);
    }

    if (type === "user") {
      router.push(`/profile/${name}`);
    }
  };

  const items: DropdownItem[] = showingHistory
    ? searchHistory.map((name, idx) => ({
        id: `${idx}`,
        name,
        type: "history",
      }))
    : searchResults.map((user) => ({
        ...user,
        type: "user",
      }));

  return (
    <div ref={containerRef} className="relative w-[85%] mx-auto">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        className="flex-1 outline-none focus:ring-0 focus:outline-none focus:border-none"
        placeholder="Enter name of user..."
        startContent={<SearchIcon className="w-4 h-4 text-gray-400" />}
        isClearable
        onClear={() => {
          setInputValue("");
          setShowDropdown(true);
          setShowingHistory(true);
        }}
      />

      {showDropdown && (
        <div
          className="absolute z-50 bg-white rounded-xl 
    w-full mt-2 shadow-md border border-black/10 p-2"
        >
          <ScrollShadow className="max-h-60" offset={0} size={0} hideScrollBar>
            <div className={`flex flex-col ${isLoading && "h-40"}`}>
              {isLoading ? (
                <div
                  className="w-full h-full flex md:gap-3 gap-2 
                flex-col items-center justify-center text-center"
                >
                  <Spinner />

                  <p>Loading...</p>
                </div>
              ) : items.length > 0 ? (
                <>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center px-3 py-2 
                hover:bg-gray-100 rounded-lg cursor-pointer"
                      onClick={() =>
                        handleItemSelect(
                          item.type === "user" ? item.username : item.name,
                          item.type,
                          item.type === "user" ? item.full_name : undefined,
                        )
                      }
                    >
                      {item.type === "user" ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={item.avatar_url}
                            alt={item.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {item.full_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              @{item.username}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm">{item.name}</span>
                      )}

                      {item.type === "history" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistoryItem(item.name);
                          }}
                          className="text-gray-400 hover:text-red-500 focus:outline-none"
                        >
                          <XIcon size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  No users found
                </p>
              )}
            </div>
          </ScrollShadow>

          {loadMore && <PrimaryLoading />}

          {nextCursor && !isLoading && (
            <div className="flex justify-end">
              <p
                className="w-fit flex items-end text-xs
      hover:text-blue-600 transition-all duration-300 ease-in-out
      text-right cursor-pointer hover:underline pr-2 pt-2"
                onClick={handleLoadMore}
              >
                View More
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
