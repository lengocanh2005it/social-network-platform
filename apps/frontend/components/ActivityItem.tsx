"use client";
import { Avatar } from "@heroui/react";
import { motion } from "framer-motion";

interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
  avatar: string;
}

export function ActivityItem({
  user,
  action,
  time,
  avatar,
}: ActivityItemProps) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0"
    >
      <Avatar
        src={avatar}
        alt={user}
        className="w-10 h-10 select-none rounded-full flex-shrink-0"
      />

      <div className="ml-3">
        <p className="text-sm font-medium text-gray-200">
          <span className="text-white">{user}</span> {action}
        </p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </motion.div>
  );
}
