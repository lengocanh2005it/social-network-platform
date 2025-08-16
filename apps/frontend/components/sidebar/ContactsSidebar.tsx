"use client";
import ContactItem from "@/components/ContactItem";
import LoadingComponent from "@/components/loading/LoadingComponent";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetConversations, useInfiniteScroll } from "@/hooks";
import { useConversationStore, useUserStore } from "@/store";
import { Input } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowLeftToLine, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiMoon, HiSearch, HiSun } from "react-icons/hi";

const ContactsSidebar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { user } = useUserStore();
  const { theme, setTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetConversations(user?.id ?? "");
  const queryClient = useQueryClient();
  const {
    setConversationsDashboard,
    conversationsDashboard,
    selectedContact,
    setSelectedContact,
  } = useConversationStore();

  const isOnlyMessages = pathname === "/dashboard/messages";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (data)
      setConversationsDashboard(data?.pages.flatMap((page) => page.data) ?? []);
  }, [setConversationsDashboard, data]);

  const filteredContacts = conversationsDashboard.filter((conversation) =>
    conversation.target_user.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastItemRef = useInfiniteScroll(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, !!hasNextPage);

  if (!mounted) return null;

  if (isLoading) {
    if (isOnlyMessages) return <LoadingComponent />;

    return <PrimaryLoading />;
  }

  return (
    <motion.div
      layout
      initial={false}
      transition={{ duration: 0.2 }}
      className={clsx(
        "flex flex-col h-full bg-white dark:bg-gray-900 relative rounded-lg",
        {
          "flex-1": isOnlyMessages,
          "flex-none min-w-[350px]": !isOnlyMessages,
        },
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <motion.h2
            className={`${isOnlyMessages ? "text-2xl" : "text-xl"} font-bold bg-gradient-to-r 
            from-purple-600 to-blue-500 bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Messages
          </motion.h2>
          <div className="flex space-x-2">
            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
              text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              {theme === "dark" ? (
                <HiSun size={18} suppressHydrationWarning />
              ) : (
                <HiMoon size={18} suppressHydrationWarning />
              )}
            </button>
            {!isOnlyMessages && (
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
            text-gray-600 dark:text-gray-300 cursor-pointer"
                onClick={() => router.push("/dashboard/messages")}
              >
                <ArrowLeftToLine size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <Input
            startContent={
              <HiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            }
            isClearable
            onClear={() => setSearchTerm("")}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            suppressHydrationWarning
            classNames={{
              base: "w-full",
              input: [
                "bg-transparent",
                "text-gray-900 dark:text-gray-100",
                "placeholder-gray-400 dark:placeholder-gray-500",
                "focus:outline-none",
              ],
              inputWrapper: [
                "bg-gray-50 dark:bg-gray-800",
                "border border-gray-300 dark:border-gray-600",
                "rounded-lg",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "focus-within:ring-2 focus-within:ring-blue-500",
                "focus-within:border-transparent",
                "transition-colors duration-200",
                "shadow-none",
              ],
              innerWrapper: "gap-2",
            }}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 h-[400px] p-2 relative">
        {filteredContacts.length > 0 ? (
          <div className="space-y-1 px-2">
            {filteredContacts.map((contact, index) => {
              const isLast = index === filteredContacts.length - 1;

              return (
                <div key={contact.id} ref={isLast ? lastItemRef : undefined}>
                  <ContactItem
                    contact={contact}
                    isSelected={selectedContact === contact.id}
                    onSelect={() => {
                      setSelectedContact(contact.id);
                      queryClient.setQueryData(
                        ["userIdByUsername", contact.target_user.username],
                        contact.target_user.user_id,
                      );
                      router.push(
                        `/dashboard/messages/${contact.target_user.username}`,
                      );
                    }}
                    isOnlyMessages={isOnlyMessages}
                    userId={user?.id ?? ""}
                  />
                </div>
              );
            })}

            {isFetchingNextPage && <PrimaryLoading />}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
              "flex flex-col items-center justify-center h-[60vh] p-3 text-center",
              isOnlyMessages ? "w-full" : "w-[260px] text-sm mx-auto",
            )}
          >
            <div className="mb-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
              <UserPlus />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
              {searchTerm ? "No contacts found" : "Your contact list is empty"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
              {searchTerm
                ? "Try adjusting your search or add a new contact."
                : "Start by adding your first contact."}
            </p>
            {!searchTerm && (
              <button
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
              rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Add Contact
              </button>
            )}
          </motion.div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

export default ContactsSidebar;
