"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import MessageOptions from "@/components/MessageOptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetMessagesOfConversation, useInfiniteScroll } from "@/hooks";
import { useConversationStore, useUserStore } from "@/store";
import { formatDateTime, Friend, Message } from "@/utils";
import { Avatar, Tooltip } from "@heroui/react";
import { Reply } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ChatBoxContentProps {
  friend: Friend;
  setParentMessage: (parentMessage: Message | null) => void;
}

const ChatBoxContent: React.FC<ChatBoxContentProps> = ({
  friend,
  setParentMessage,
}) => {
  const { user } = useUserStore();
  const { messages, conversations, setMessages, hasNewMessageMap } =
    useConversationStore();
  const endRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const initialLoadDone = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const isInitialMount = useRef(true);
  const prevScrollHeightRef = useRef(0);

  const convId = conversations[friend.user_id]?.id;

  const currentMessages = convId ? messages[convId] || [] : [];

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      messagesEndRef.current.scrollIntoView({ behavior });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || isScrollingRef.current) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    const atBottom = scrollHeight - (scrollTop + clientHeight) < 50;
    setIsUserAtBottom(atBottom);
  }, []);

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessagesOfConversation(user?.id ?? "", convId ?? "");

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setTimeout(() => scrollToBottom("auto"), 100);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    if (isUserAtBottom && !isFetchingNextPage) {
      scrollToBottom();
    }
  }, [
    currentMessages.length,
    isUserAtBottom,
    isFetchingNextPage,
    scrollToBottom,
  ]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isFetchingNextPage || !hasNextPage) return;

    const prevScrollHeight = container.scrollHeight;
    prevScrollHeightRef.current = prevScrollHeight;
  }, [isFetchingNextPage, hasNextPage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isFetchingNextPage || !prevScrollHeightRef.current)
      return;

    const newScrollHeight = container.scrollHeight;
    const scrollDifference = newScrollHeight - prevScrollHeightRef.current;
    container.scrollTop = scrollDifference;
    prevScrollHeightRef.current = 0;
  }, [isFetchingNextPage, currentMessages.length]);

  useEffect(() => {
    if (!convId) return;

    if (
      (messages[convId]?.length && !initialLoadDone.current) ||
      hasNewMessageMap[convId]
    ) {
      endRef.current?.scrollIntoView({ behavior: "auto" });
      initialLoadDone.current = true;
    }
  }, [messages, convId, conversations, friend, hasNewMessageMap]);

  useEffect(() => {
    if (messagesData && convId) {
      const allMessages =
        messagesData?.pages
          .slice()
          .reverse()
          .flatMap((page) => page.data) ?? [];
      setMessages(convId, allMessages);
    }
  }, [messagesData, convId, setMessages]);

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const lastMessageRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, hasNextPage);

  return (
    <>
      {isMessagesLoading ? (
        <div className="min-h-[270px] relative flex items-center justify-center">
          <PrimaryLoading />
        </div>
      ) : (
        <>
          <ScrollArea
            className="min-h-[270px] relative"
            ref={scrollContainerRef}
          >
            <div className="flex-1 overflow-y-auto p-3 text-sm space-y-3">
              {currentMessages?.length > 0 ? (
                <>
                  {isFetchingNextPage && <PrimaryLoading />}

                  {currentMessages?.map((msg, index) => {
                    const isMine = msg.user?.id === user?.id;

                    const isFirst = index === 0;

                    const isEdited =
                      new Date(msg?.created_at).getTime() !==
                      new Date(msg?.updated_at).getTime();

                    return (
                      <div
                        key={msg.id}
                        ref={isFirst ? lastMessageRef : null}
                        className={`flex ${isEdited || msg.parent_message ? "items-end" : "items-start"} 
                  group relative md:gap-2 gap-1 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                      >
                        {!isMine && (
                          <Avatar
                            src={msg.user?.avatar_url}
                            alt={msg.user?.full_name}
                            className="cursor-pointer select-none w-10 h-10 flex-shrink-0 rounded-full"
                            onClick={() => handleViewProfile(friend.username)}
                          />
                        )}

                        {isMine && !msg?.deleted_at && (
                          <MessageOptions message={msg} />
                        )}

                        <div className="flex flex-col md:gap-2 gap-1">
                          {msg.parent_message && (
                            <div
                              className={`border-l-4 pl-3 pr-2 py-2 rounded-md bg-gray-100
                          text-sm text-gray-700 max-w-xs ${
                            isMine
                              ? "bg-blue-100 border-blue-400 dark:bg-white/20"
                              : "bg-gray-100 border-gray-400 dark:bg-white/20"
                          }`}
                            >
                              <p
                                className="font-medium text-gray-600 dark:text-white/70 
                        text-xs mb-1 truncate"
                              >
                                Replying to{" "}
                                {msg.parent_message.user.id === user?.id
                                  ? "you"
                                  : msg.parent_message.user.full_name}
                              </p>

                              <p className="text-sm text-gray-800 dark:text-white/80 truncate">
                                {msg.parent_message.content}
                              </p>
                            </div>
                          )}

                          <div className="relative">
                            {isEdited && !msg.deleted_at && (
                              <p
                                className={`text-gray-600 dark:text-white/70 text-xs pb-1 
                            ${isMine && "text-right"}`}
                              >
                                Edited
                              </p>
                            )}

                            {msg.deleted_at ? (
                              <div
                                className="bg-gray-200 text-gray-800 opacity-50 select-none
                      max-w-xs px-4 py-2 rounded-xl dark:bg-white/40 dark:text-white"
                              >
                                <p className="text-xs">
                                  This message has been removed.
                                </p>
                              </div>
                            ) : (
                              <div
                                className={`max-w-xs px-4 py-2 rounded-xl ${
                                  isMine
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                                }`}
                              >
                                {msg?.created_at && (
                                  <Tooltip
                                    content={formatDateTime(msg?.created_at)}
                                    showArrow
                                    className="text-xs"
                                  >
                                    <p className="text-sm break-all">
                                      {msg?.content}
                                    </p>
                                  </Tooltip>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {isMine && (
                          <Avatar
                            src={msg.user?.avatar_url}
                            alt={msg.user?.full_name}
                            className="cursor-pointer select-none w-10 h-10 flex-shrink-0 rounded-full"
                          />
                        )}

                        {!isMine && !msg.deleted_at && (
                          <Tooltip content="Reply" showArrow>
                            <Reply
                              size={20}
                              className="opacity-0 group-hover:opacity-100 transition-opacity 
            cursor-pointer focus:outline-none"
                              onClick={() => setParentMessage(msg)}
                            />
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </>
              ) : (
                <>
                  <div
                    className="flex flex-col items-center md:gap-1 gap-3 
          justify-center text-center md:mt-8 mt-6"
                  >
                    <h1 className="text-medium font-semibold">
                      No messages yet
                    </h1>

                    <p className="text-sm text-black/70 dark:text-white/70">
                      Start the conversation by sending a message!
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </>
  );
};

export default ChatBoxContent;
