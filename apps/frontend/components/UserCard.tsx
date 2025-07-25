"use client";
import { UserDashboardType } from "@/utils";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  Ellipsis,
  Eye,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";

export const UserCard = ({ user }: { user: UserDashboardType }) => {
  const formatLastActive = (dateString?: string) => {
    if (!dateString) return "Never active";

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Active today";
    if (diffDays === 1) return "Active yesterday";
    if (diffDays < 7) return `Active ${diffDays} days ago`;

    return `Active on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white 
      dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="relative">
            <Avatar
              src={
                user.profile.avatar_url ||
                `https://i.pravatar.cc/150?u=${user.id}`
              }
              className="h-14 w-14 rounded-full ring-2 ring-purple-500 shadow-sm select-none"
            />
            <span
              className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 
                ring-white dark:ring-gray-800 ${
                  user.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user.profile.first_name + " " + user.profile.last_name ||
                  "No Name"}
              </h3>

              <Dropdown
                placement="bottom-end"
                className="text-black dark:text-white"
                shouldBlockScroll={false}
              >
                <DropdownTrigger>
                  <Button isIconOnly className="bg-transparent">
                    <Ellipsis className="text-gray-700 focus:outline-none dark:text-white/70" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="" variant="flat">
                  <DropdownItem key="view-as" startContent={<Eye />}>
                    View Profile
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="flex flex-col md:gap-1">
              <Tooltip content={user.email}>
                <div
                  className="flex items-center text-sm text-gray-500 dark:text-gray-400 truncate
              w-fit max-w-full"
                >
                  <MailIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </Tooltip>

              {user?.profile?.username && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span>{user.profile.username}</span>
                </div>
              )}

              {user?.profile?.phone_number && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <PhoneIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span>{user.profile.phone_number}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user.role && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                text-xs font-medium bg-purple-100 text-purple-800 
                dark:bg-purple-900/30 dark:text-purple-300"
                >
                  <ShieldIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{user.role}</span>
                </span>
              )}

              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.last_seen_at
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {formatLastActive(user.last_seen_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const UserCardSkeleton = () => (
  <div
    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white 
  dark:bg-gray-800"
  >
    <div className="flex items-start space-x-4">
      <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);
