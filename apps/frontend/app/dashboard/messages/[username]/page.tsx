"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageBubble from "@/components/messages/MessageBubble";
import MessageInput from "@/components/messages/MessageInput";
import {
  useGetConversationWithTargetUser,
  useGetMessagesOfConversation,
} from "@/hooks";
import { getProfile } from "@/lib/api/users";
import { useConversationStore, useUserStore } from "@/store";
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
  const { messages, setNextCursor, setMessages } = useConversationStore();

  const { data: targetUser, isLoading: isTargetUserLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => getProfile(username, { username, includeProfile: true }),
    initialData: () => queryClient.getQueryData(["userProfile", username]),
    staleTime: 5 * 60 * 1000,
  });

  const { data: conversationData, isLoading } =
    useGetConversationWithTargetUser(user?.id ?? "", targetUser?.id ?? "");

  const { data: messagesData, isLoading: isMessagesLoading } =
    useGetMessagesOfConversation(user?.id ?? "", conversationId, {});

  useEffect(() => {
    if (conversationData?.id) {
      setConversationId(conversationData.id);
    }
  }, [conversationData?.id]);

  useEffect(() => {
    if (messagesData && conversationId) {
      setMessages(conversationId, messagesData.data || []);
      setNextCursor(messagesData.nextCursor ?? null);
    }
  }, [messagesData, conversationId, setMessages, setNextCursor]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
    setTimeout(scrollToBottom, 100);
  }, [newMessage, scrollToBottom]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  if (isLoading || isMessagesLoading || isTargetUserLoading)
    return <PrimaryLoading />;

  const currentMessages = messages[conversationId] || [];
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
          currentMessages.map((message) => {
            const isSelf = message.user.id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <MessageBubble
                  message={message}
                  isSelf={isSelf}
                  user={user ?? undefined}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </motion.main>

      <MessageInput
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        theme={theme as "light" | "dark" | "system"}
      />
    </motion.div>
  );
};

export default MessagesDetailsPage;
