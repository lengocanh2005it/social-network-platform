"use client";
import ChatBox from "@/components/chatbox/ChatBox";
import ConversationsList from "@/components/ConversationsList";
import EmptyDefault from "@/components/EmptyDefault";
import EmptySearch from "@/components/EmptySearch";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetConversations, useInfiniteScroll } from "@/hooks";
import { useUserStore } from "@/store";
import { Input } from "@heroui/react";
import { debounce } from "lodash";
import { MessageCircle, SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

const ConversationsDropdown: React.FC = () => {
  const { user } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"default" | "search">("default");
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useGetConversations(user?.id ?? "", {
    full_name: searchTerm,
  });

  const conversations = data?.pages.flatMap((page) => page.data) ?? [];

  const lastPostRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, !!hasNextPage);

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

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        refetch();
      }, 500),
    [refetch],
  );

  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch();
    } else {
      refetch();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch, refetch]);

  return (
    <section className="relative dark:text-white">
      <div ref={iconRef}>
        <MessageCircle
          className="cursor-pointer select-none focus:outline-none dark:text-white"
          onClick={() => setShowDropdown((prev) => !prev)}
        />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-[600] bg-white rounded-xl w-[440px] mt-2 shadow-md 
          flex flex-col gap-1 border border-black/10 p-4 right-12 
          dark:bg-black dark:border-white/20"
        >
          <h1 className="text-left text-lg text-black/80 dark:text-white/80">
            Chats
          </h1>

          <ScrollArea
            className={`${
              conversations.length > 0 && !isLoading ? "h-[350px]" : "h-[250px]"
            } mt-2 text-sm text-gray-700 relative 
            border-t border-t-black/10 dark:border-t-white/20 py-2 pr-2`}
          >
            {isLoading ? (
              <PrimaryLoading />
            ) : (
              <section className="flex flex-col md:gap-3 gap-2">
                <Input
                  className="w-[90%] mx-auto dark:caret-white dark:text-white"
                  placeholder="Enter name..."
                  startContent={<SearchIcon className="dark:text-white/80" />}
                  value={searchTerm}
                  onValueChange={(value) => {
                    setSearchTerm(value);
                    setMode(value.trim() ? "search" : "default");
                  }}
                  isClearable
                />

                {conversations.length === 0 ? (
                  mode === "default" ? (
                    <EmptyDefault />
                  ) : (
                    <EmptySearch />
                  )
                ) : (
                  <ConversationsList
                    conversations={conversations}
                    hasMore={!!hasNextPage}
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
