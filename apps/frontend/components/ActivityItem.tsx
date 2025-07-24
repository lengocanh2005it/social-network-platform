import { Activity } from "@/utils";
import { Avatar } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import React from "react";

interface ActivityItemProps {
  activity: Activity;
  ref: (node: HTMLDivElement | null) => void;
  index: number;
  length: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  ref,
  index,
  length,
}) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0"
      ref={index === length - 1 ? ref : null}
    >
      <Avatar
        src={activity.user.profile.avatar_url}
        alt={
          activity.user.profile.first_name +
          " " +
          activity.user.profile.last_name
        }
        className="w-10 h-10 select-none rounded-full flex-shrink-0"
      />

      <div className="ml-2 relative">
        <div
          className="text-sm font-medium text-gray-200 dark:text-gray-300 
        flex items-center gap-1"
        >
          <p>
            {activity.user.profile.first_name +
              " " +
              activity.user.profile.last_name}
          </p>

          <p className="text-gray-400 dark:text-gray-400">{activity.action}</p>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(activity.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
