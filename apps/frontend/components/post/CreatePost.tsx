"use client";
import CreatePostModal from "@/components/modal/CreatePostModal";
import { useUserStore } from "@/store";
import { Avatar } from "@heroui/react";
import { ImageIcon, SmileIcon, VideoIcon } from "lucide-react";
import { useState } from "react";

const activities = [
  {
    key: 1,
    icon: <VideoIcon className="w-5 h-5" />,
    content: "Live video",
  },
  {
    key: 2,
    icon: <ImageIcon className="w-5 h-5" />,
    content: "Photo/video",
  },
  {
    key: 3,
    icon: <SmileIcon className="w-5 h-5" />,
    content: "Feeling/activity",
  },
];

const CreatePost = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user, clearSelectedTaggedUsers } = useUserStore();

  return (
    <>
      {user && (
        <>
          <div
            className="bg-white rounded-2xl border border-black/10 p-4 w-full mx-auto
          dark:bg-black dark:text-white dark:border-white/30"
          >
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.profile.avatar_url}
                className="select-none cursor-pointer flex-shrink-0"
              />

              <div
                onClick={() => {
                  setIsOpen(true);
                  clearSelectedTaggedUsers();
                }}
                className="bg-gray-200 text-gray-500 rounded-full px-4 py-2 w-full 
            cursor-pointer hover:bg-gray-300 dark:bg-white/20 dark:hover:bg-white/30 
            transition select-none dark:text-white/60"
              >
                What&apos;s on your mind, {user.profile.last_name}?
              </div>
            </div>

            <hr className="my-4 dark:bg-white/20" />

            <div
              className="grid grid-cols-3 px-2 text-sm text-gray-500
            dark:text-white/80"
            >
              {activities.map((activity) => (
                <div
                  key={activity.key}
                  className="flex items-center justify-center gap-2 p-2 hover:bg-black/10 
            rounded-sm transition-all cursor-pointer dark:hover:bg-white/20"
                >
                  {activity.icon}
                  <span>{activity.content}</span>
                </div>
              ))}
            </div>
          </div>

          <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
      )}
    </>
  );
};

export default CreatePost;
