"use client";
import ConfirmDeleteStoryModal from "@/components/modal/ConfirmDeleteStoryModal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import StoryModal from "@/components/modal/StoryModal";
import { useUpdateStoryStatus } from "@/hooks";
import { Story } from "@/utils";
import { Avatar, Button } from "@heroui/react";
import { StoryStatusEnum } from "@repo/db";
import { formatDistanceToNow } from "date-fns";
import { LockIcon, LockOpen, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiClock, FiEye } from "react-icons/fi";

interface StoryCardProps {
  story: Story;
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, setStories }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isShowReasonModal, setIsShowReasonModal] = useState<boolean>(false);
  const { mutate: mutateUpdateStoryStatus, isPending } = useUpdateStoryStatus();
  const isExpired = new Date(story.expires_at) <= new Date();
  const timeRemaining = formatDistanceToNow(new Date(story.expires_at), {
    addSuffix: true,
  });
  const [isShowStoryModal, setIsShowStoryModal] = useState<boolean>(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleConfirmClick = () => {
    if (story.status === StoryStatusEnum.active) {
      setIsShowReasonModal(true);
    } else {
      handleRestoreOrDeleteStory(
        story.status === "expired" ? "delete" : "restore",
      );
    }
  };

  const handleRestoreOrDeleteStory = (type: "delete" | "restore") => {
    mutateUpdateStoryStatus(
      {
        storyId: story.id,
        updateStoryStatusDto: {
          status:
            type === "delete"
              ? StoryStatusEnum.expired
              : StoryStatusEnum.active,
        },
      },
      {
        onSuccess: (data, variables) => {
          if (data && data?.success && typeof data?.message === "string") {
            if (
              variables.updateStoryStatusDto.status === StoryStatusEnum.expired
            ) {
              setStories((prev) =>
                prev.filter((p) => p.id !== variables.storyId),
              );
            } else if (
              variables.updateStoryStatusDto.status === StoryStatusEnum.active
            ) {
              setStories((prevStories) =>
                prevStories.map((story) =>
                  story.id === variables.storyId
                    ? {
                        ...story,
                        status: variables.updateStoryStatusDto.status,
                      }
                    : story,
                ),
              );
            }
            setIsOpen(false);
            toast.success(data.message, {
              position: "bottom-right",
            });
          }
        },
      },
    );
  };

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full 
    transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700">
        <Avatar
          src={story.user.avatar_url}
          alt={story.user.full_name}
          className="w-10 h-10 flex-shrink-0 select-none cursor-pointer"
        />
        <div className="ml-3 flex-1">
          <h3
            className="font-semibold text-gray-900 dark:text-white
          hover:underline hover:cursor-pointer"
          >
            {story.user.full_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{story.user.username}
          </p>
        </div>

        <Button
          onPress={handleClick}
          isIconOnly
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
          transition-colors bg-transparent"
          startContent={
            story.status === StoryStatusEnum.active ? (
              <LockIcon size={20} />
            ) : story.status === StoryStatusEnum.inactive ? (
              <LockOpen size={20} />
            ) : (
              <TrashIcon size={20} />
            )
          }
        />
      </div>

      <div className="p-4" onClick={() => setIsShowStoryModal(true)}>
        {story.content_type === "image" && story.content_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={story.content_url}
              alt="Story content"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {story.text_content && (
          <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-line">
            {story.text_content}
          </p>
        )}
      </div>

      <div
        className="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center 
      text-sm"
      >
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <FiEye className="mr-1" />
          <span>{story.total_views} views</span>
          {story.viewed_by_current_user && (
            <span
              className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 
            dark:text-blue-200 rounded-full text-xs"
            >
              Viewed
            </span>
          )}
        </div>

        {!isExpired ? (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <FiClock className="mr-1" />
            <span>{timeRemaining}</span>
          </div>
        ) : (
          <span className="text-red-500 dark:text-red-400 font-semibold">
            Story expired
          </span>
        )}
      </div>

      {isOpen && (
        <ConfirmModal
          open={isOpen}
          onOpenChange={setIsOpen}
          onCancel={() => setIsOpen(false)}
          isLoading={isPending}
          onConfirm={handleConfirmClick}
          textHeader={`${
            story.status === StoryStatusEnum.inactive
              ? "Restore Story"
              : story.status === StoryStatusEnum.expired
                ? "Delete Story"
                : "Hide Story"
          }`}
          title={`${
            story.status === StoryStatusEnum.inactive
              ? "Do you want to restore this story?"
              : story.status === StoryStatusEnum.expired
                ? "Do you want to delete this story?"
                : "Do you want to hide this story?"
          }`}
          description={`${
            story.status === StoryStatusEnum.inactive
              ? "The story will be visible to the user and other users again."
              : story.status === StoryStatusEnum.expired
                ? "This action is permanent and cannot be undone."
                : "The story will be hidden from the user and other users."
          }`}
          confirmText={`${
            story.status === StoryStatusEnum.inactive
              ? "Restore"
              : story.status === StoryStatusEnum.expired
                ? "Delete"
                : "Hide"
          }`}
          cancelText="Cancel"
        />
      )}

      {isShowReasonModal && (
        <ConfirmDeleteStoryModal
          isOpen={isShowReasonModal}
          onOpenChange={setIsShowReasonModal}
          setStories={setStories}
          story={story}
          setIsOpen={setIsOpen}
        />
      )}

      {isShowStoryModal && (
        <StoryModal story={story} onClose={() => setIsShowStoryModal(false)} />
      )}
    </div>
  );
};

export default StoryCard;
