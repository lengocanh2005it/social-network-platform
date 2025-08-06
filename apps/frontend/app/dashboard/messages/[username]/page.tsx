"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageBubble from "@/components/messages/MessageBubble";
import MessageInput from "@/components/messages/MessageInput";
import {
  useCreateMessage,
  useFingerprint,
  useGetConversationWithTargetUser,
  useGetMessagesOfConversation,
  useInfiniteScroll,
  useSocket,
} from "@/hooks";
import { getProfile } from "@/lib/api/users";
import { useConversationStore, useUserStore } from "@/store";
import {
  CreateMessageDto,
  groupMessagesByDate,
  Message,
  SocketNamespace,
} from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const MessagesDetailsPage = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const { username } = useParams() as { username: string };
  const { theme } = useTheme();
  const [conversationId, setConversationId] = useState("");
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const isInitialMount = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const isScrollingRef = useRef(false);
  const {
    messages,
    setMessages,
    addMessage,
    conversations,
    setHasNewMessage,
    setConversationsDashboard,
    conversationsDashboard,
    setSelectedContact,
  } = useConversationStore();
  const { mutate: mutateCreateMessage, isPending } = useCreateMessage();
  const finger_print = useFingerprint();
  const { on, off, emit } = useSocket(
    SocketNamespace.CONVERSATIONS,
    finger_print ?? "",
  );

  const { data: targetUser, isLoading: isTargetUserLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => getProfile(username, { username, includeProfile: true }),
    initialData: () => queryClient.getQueryData(["userProfile", username]),
    staleTime: 5 * 60 * 1000,
  });

  const { data: conversationData, isLoading } =
    useGetConversationWithTargetUser(user?.id ?? "", targetUser?.id ?? "");

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessagesOfConversation(user?.id ?? "", conversationId);

  useEffect(() => {
    if (conversationData?.id) {
      setSelectedContact(conversationData.id);
      setConversationId(conversationData.id);
    }
  }, [conversationData?.id, setSelectedContact]);

  useEffect(() => {
    if (messagesData && conversationId) {
      const allMessages =
        messagesData?.pages
          .slice()
          .reverse()
          .flatMap((page) => page.data) ?? [];
      setMessages(conversationId, allMessages);
    }
  }, [messagesData, conversationId, setMessages]);

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const currentMessages = conversationId ? messages[conversationId] || [] : [];

  const groupedMessages = groupMessagesByDate(currentMessages);

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

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !targetUser?.id) return;

    const createMessageDto: CreateMessageDto = {
      content: newMessage,
      target_id: targetUser.id,
    };

    mutateCreateMessage(createMessageDto, {
      onSuccess: (data: Message) => {
        if (data) {
          const updatedDashboard = conversationsDashboard.map((item) =>
            item.id === data.conversation_id
              ? {
                  ...item,
                  last_message: data,
                  last_message_at: data.created_at,
                }
              : item,
          );

          setConversationsDashboard(updatedDashboard);
          emit("sendMessage", {
            newMessage: data,
            target_id: createMessageDto.target_id,
          });
          setHasNewMessage(conversations[targetUser?.id]?.id, true);
          setTimeout(() => {
            setHasNewMessage(conversations[targetUser?.id]?.id, false);
          }, 800);
          setNewMessage("");
          scrollToBottom();
        }
      },
    });
  }, [
    newMessage,
    conversations,
    emit,
    mutateCreateMessage,
    setHasNewMessage,
    targetUser?.id,
    setConversationsDashboard,
    conversationsDashboard,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (!conversationId || !targetUser?.id) return;

    const messageHandler = (data: Message) => {
      addMessage(conversationId, data);
      if (isUserAtBottom) scrollToBottom();
    };

    on("newMessage", messageHandler);

    return () => {
      off("newMessage", messageHandler);
    };
  }, [
    addMessage,
    conversationId,
    on,
    off,
    scrollToBottom,
    targetUser?.id,
    isUserAtBottom,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (isPending) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, isPending],
  );

  const lastMessageRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, hasNextPage);

  if (isLoading || isMessagesLoading || isTargetUserLoading)
    return <PrimaryLoading />;

  const fullName = `${targetUser?.profile?.first_name ?? ""} ${targetUser?.profile?.last_name ?? ""}`;

  return (
    <motion.div
      className="flex flex-col h-full w-full overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ChatHeader
        avatar={targetUser?.profile?.avatar_url}
        name={fullName}
        username={targetUser?.profile?.username ?? ""}
        isOnline={currentMessages.some(
          (cm) => cm.user.id === targetUser.id && cm.user.is_online === true,
        )}
      />

      <motion.main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          <>
            {isFetchingNextPage && <PrimaryLoading />}

            {/* {currentMessages.map((message, i) => {
              const isSelf = message.user.id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                  ref={i === 0 ? lastMessageRef : null}
                >
                  <MessageBubble
                    message={message}
                    isSelf={isSelf}
                    user={user ?? undefined}
                  />
                </div>
              );
            })} */}
            {Object.entries(groupedMessages).map(
              ([dateLabel, messages], groupIndex) => (
                <div key={dateLabel} className="space-y-2">
                  <div
                    className="text-center text-xs font-medium text-gray-500 
                dark:text-gray-400 my-4"
                  >
                    {dateLabel}
                  </div>

                  {messages.map((message, i) => {
                    const isSelf = message.user.id === user?.id;

                    const isFirstMessage = groupIndex === 0 && i === 0;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                        ref={isFirstMessage ? lastMessageRef : null}
                      >
                        <MessageBubble
                          message={message}
                          isSelf={isSelf}
                          user={user ?? undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              ),
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </motion.main>

      <MessageInput
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        theme={theme as "light" | "dark" | "system"}
        isPending={isPending}
      />
    </motion.div>
  );
};

export default MessagesDetailsPage;
