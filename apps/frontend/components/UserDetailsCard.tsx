"use client";
import { FullUserType } from "@/store";
import { Avatar, Button, Chip, Progress, Tooltip } from "@heroui/react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  MailWarning,
  Settings,
  Shield,
  UserCheck,
} from "lucide-react";
import React from "react";

interface UserDetailsCardProps {
  viewedUser: FullUserType;
  profileCompletion: number;
  onEditProfile?: () => void;
  onVerifyEmail?: () => void;
}

const UserDetailsCard: React.FC<UserDetailsCardProps> = ({
  viewedUser,
  profileCompletion,
  onEditProfile,
}) => {
  const getProgressColor = () => {
    if (profileCompletion > 75) return "success";
    if (profileCompletion > 50) return "primary";
    return "warning";
  };

  const getProfileMessage = () => {
    if (profileCompletion < 50) return "Complete more profile sections";
    if (profileCompletion < 80) return "Good progress! Keep going";
    return "Profile complete! Well done";
  };

  return (
    <div
      className="w-full max-w-sm p-6 rounded-2xl border dark:border-gray-700 bg-white 
    dark:bg-gray-800 shadow-sm"
    >
      <div className="flex flex-col items-center gap-4 mb-3">
        <div className="relative w-fit group">
          <Avatar
            src={viewedUser.profile.avatar_url}
            className="w-28 h-28 text-large duration-300 cursor-pointer"
            onClick={onEditProfile}
          />

          <div
            className={`absolute bottom-0 right-2 rounded-full p-1 shadow-md ${
              viewedUser.is_email_verified
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
            title={viewedUser.is_email_verified ? "Verified" : "Not Verified"}
          >
            {viewedUser.is_email_verified ? (
              <UserCheck size={16} />
            ) : (
              <MailWarning size={16} />
            )}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {viewedUser.profile.first_name} {viewedUser.profile.last_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{viewedUser.profile.username}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-5">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewedUser.total_friends}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Connections
          </p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(new Date(viewedUser.profile.created_at), "yyyy")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Member since
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Profile Strength
          </span>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
            {profileCompletion}%
          </span>
        </div>

        <Progress
          value={profileCompletion}
          color={getProgressColor()}
          className="h-2 mb-2"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {getProfileMessage()}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-center">
          <Tooltip content="Edit profile">
            <Button
              isIconOnly
              variant="light"
              size="md"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              onPress={onEditProfile}
            >
              <Settings size={18} />
            </Button>
          </Tooltip>

          <Tooltip content="Activity log">
            <Button
              isIconOnly
              variant="light"
              size="md"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Activity size={18} />
            </Button>
          </Tooltip>

          <Tooltip content="Security">
            <Button
              isIconOnly
              variant="light"
              size="md"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Shield size={18} />
            </Button>
          </Tooltip>

          <Tooltip content="Verification">
            <Button
              isIconOnly
              variant="light"
              size="md"
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
              dark:hover:bg-gray-600"
            >
              <UserCheck size={18} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last active:</span>
          <span className="font-medium">
            {viewedUser.last_seen_at
              ? formatDistanceToNow(new Date(viewedUser.last_seen_at), {
                  addSuffix: true,
                })
              : "Not active yet"}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-gray-500 dark:text-gray-400">Status:</span>
          <Chip
            variant="dot"
            color={viewedUser.is_online ? "success" : "default"}
            size="sm"
          >
            {viewedUser.is_online ? "Active" : "Offline"}
          </Chip>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsCard;
