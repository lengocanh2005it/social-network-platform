"use client";
import ChatBox from "@/components/chatbox/ChatBox";
import ConversationsList from "@/components/ConversationsList";
import EmptyDefault from "@/components/EmptyDefault";
import EmptySearch from "@/components/EmptySearch";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetConversations, useInfiniteScroll } from "@/hooks";
import { getConversations } from "@/lib/api/conversations";
import { useUserStore } from "@/store";
import { ConversationDropdownType, handleAxiosError } from "@/utils";
import { Input } from "@heroui/react";
import { debounce } from "lodash";
import { MessageCircle, SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

const ConversationsDropdown: React.FC = () => {
  const { user } = useUserStore();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { data, isLoading } = useGetConversations(user?.id ?? "");
  const [conversations, setConversations] = useState<
    ConversationDropdownType[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState<"default" | "search">("default");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        iconRef.current &&
        !iconRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (data) {
      setConversations(data?.data ?? []);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setConversations, setNextCursor]);

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getConversations({
        after: nextCursor,
      });

      setNextCursor(res?.nextCursor ?? null);
      setConversations((prev) => [...prev, ...res?.data]);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const lastPostRef = useInfiniteScroll(loadMore, !!nextCursor);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        setIsSearching(true);
        try {
          await handleGetConversationsByFullName(searchTerm);
        } finally {
          setIsSearching(false);
        }
      }, 500),
    [],
  );

  const handleGetConversationsByFullName = async (full_name: string) => {
    const res = await getConversations({
      full_name,
    });

    setConversations(res?.data ?? []);
    setNextCursor(res?.nextCursor ?? null);
  };

  useEffect(() => {
    if (value.trim() !== "") {
      debouncedSearch(value);
    } else {
      (async () => {
        setIsSearching(true);
        try {
          const res = await getConversations();
          setConversations(res?.data ?? []);
          setNextCursor(res?.nextCursor ?? null);
        } finally {
          setIsSearching(false);
        }
      })();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [value, debouncedSearch]);

  return (
    <section className="relative dark:text-white">
      <div ref={iconRef}>
        <MessageCircle
          className="cursor-pointer select-none focus:outline-none dark:text-white"
          onClick={() => setShowDropdown(!showDropdown)}
        />
      </div>

      {showDropdown && (
        <div
          className="fixed z-[600] bg-white rounded-xl w-[440px]
          mt-2 shadow-md flex flex-col gap-1
          border border-black/10 p-4 right-12 dark:bg-black dark:border-white/20"
          ref={dropdownRef}
        >
          <h1 className="text-left text-lg text-black/80 dark:text-white/80">
            Chats
          </h1>

          <ScrollArea
            className={`${conversations.length > 0 && !isSearching ? "h-[350px]" : "h-[250px]"} mt-2 text-sm 
            text-gray-700 relative border-t border-t-black/10 dark:border-t-white/20 py-2 pr-2`}
          >
            {isLoading ? (
              <PrimaryLoading />
            ) : (
              <section className="flex flex-col md:gap-3 gap-2">
                <Input
                  className="w-[90%] mx-auto dark:caret-white dark:text-white"
                  placeholder="Enter name..."
                  startContent={<SearchIcon className="dark:text-white/80" />}
                  value={value}
                  onValueChange={(value) => {
                    setValue(value);
                    setMode(value.trim() ? "search" : "default");
                  }}
                  isClearable
                />

                {isSearching ? (
                  <PrimaryLoading />
                ) : conversations.length === 0 ? (
                  mode === "default" ? (
                    <EmptyDefault />
                  ) : (
                    <EmptySearch />
                  )
                ) : (
                  <ConversationsList
                    conversations={conversations}
                    hasMore={hasMore}
                    ref={lastPostRef}
                    setShowDropdown={setShowDropdown}
                  />
                )}
              </section>
            )}
          </ScrollArea>
        </div>
      )}

      <ChatBox right={15} />
    </section>
  );
};

export default ConversationsDropdown;
