"use client";
import MessageOptions from "@/components/MessageOptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetMessagesOfConversation } from "@/hooks";
import { getMessagesOfConversation } from "@/lib/api/conversations";
import { useConversationStore, useUserStore } from "@/store";
import { formatDateTime, Friend, handleAxiosError, Message } from "@/utils";
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
  const {
    messages,
    conversations,
    nextCursor,
    setNextCursor,
    addOldMessages,
    setMessages,
    hasNewMessageMap,
  } = useConversationStore();
  const endRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const isLoadingOldMessages = useRef(false);
  const topMessageRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeight = useRef<number>(0);
  const initialLoadDone = useRef<boolean>(false);

  const convId = conversations[friend.user_id]?.id;

  const { data } = useGetMessagesOfConversation(user?.id ?? "", convId ?? "");

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
    if (data && convId) {
      setMessages(convId, data.data);
      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    }
  }, [data, convId, conversations, friend, setMessages, setNextCursor]);

  const fetchMoreMessages = useCallback(async () => {
    const conversationId = convId;

    if (isLoadingOldMessages.current || !nextCursor || !conversationId) return;

    isLoadingOldMessages.current = true;
    setLoadingMore(true);

    previousScrollHeight.current =
      scrollContainerRef.current?.scrollHeight || 0;

    try {
      const res = await getMessagesOfConversation(conversationId, {
        after: nextCursor,
      });

      if (!res.data.length || !res.nextCursor) {
        setHasMore(false);
      } else {
        addOldMessages(conversationId, res.data);
        setNextCursor(res.nextCursor);

        setTimeout(() => {
          if (scrollContainerRef.current) {
            const newHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop =
              newHeight - previousScrollHeight.current;
          }
        }, 50);
      }
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setLoadingMore(false);
      isLoadingOldMessages.current = false;
    }
  }, [
    convId,
    nextCursor,
    addOldMessages,
    setNextCursor,
    setHasMore,
    setLoadingMore,
  ]);

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  useEffect(() => {
    const observerTarget = topMessageRef.current;

    if (!observerTarget || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !isLoadingOldMessages.current &&
          !loadingMore
        ) {
          fetchMoreMessages();
        }
      },
      {
        root: null,
        rootMargin: "300px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(observerTarget);

    return () => {
      observer.unobserve(observerTarget);
    };
  }, [hasMore, loadingMore, convId, messages, fetchMoreMessages]);

  useEffect(() => {
    const checkNeedToFetch = () => {
      const topEl = topMessageRef.current;
      if (
        topEl &&
        hasMore &&
        !isLoadingOldMessages.current &&
        !loadingMore &&
        nextCursor
      ) {
        const rect = topEl.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight) {
          fetchMoreMessages();
        }
      }
    };

    const timeout = setTimeout(checkNeedToFetch, 100);

    return () => clearTimeout(timeout);
  }, [nextCursor, hasMore, loadingMore, fetchMoreMessages]);

  return (
    <ScrollArea className="min-h-[270px] relative" ref={scrollContainerRef}>
      <div className="flex-1 overflow-y-auto p-3 text-sm space-y-3">
        {messages[conversations[friend.user_id]?.id]?.length > 0 ? (
          <>
            {messages[conversations[friend.user_id]?.id]?.map((msg, index) => {
              const isMine = msg.user?.id === user?.id;

              const isFirst = index === 0;

              const isEdited =
                new Date(msg?.created_at).getTime() !==
                new Date(msg?.updated_at).getTime();

              return (
                <div
                  key={msg.id}
                  ref={isFirst ? topMessageRef : undefined}
                  className={`flex ${isEdited || msg.parent_message ? "items-end" : "items-center"} 
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
                              ? "bg-blue-100 border-blue-400"
                              : "bg-gray-100 border-gray-400"
                          }`}
                      >
                        <p className="font-medium text-gray-600 text-xs mb-1 truncate">
                          Replying to{" "}
                          {msg.parent_message.user.id === user?.id
                            ? "you"
                            : msg.parent_message.user.full_name}
                        </p>

                        <p className="text-sm text-gray-800 truncate">
                          {msg.parent_message.content}
                        </p>
                      </div>
                    )}

                    <div className="relative">
                      {isEdited && !msg.deleted_at && (
                        <p
                          className={`text-gray-600 text-xs pb-1 ${isMine && "text-right"}`}
                        >
                          Edited
                        </p>
                      )}

                      {msg.deleted_at ? (
                        <div
                          className="bg-gray-200 text-gray-800 opacity-50 select-none
                      max-w-xs px-4 py-2 rounded-xl"
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
              <h1 className="text-medium font-semibold">No messages yet</h1>

              <p className="text-sm text-black/70">
                Start the conversation by sending a message!
              </p>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatBoxContent;
