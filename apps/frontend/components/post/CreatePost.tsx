"use client";
import CreatePostModal from "@/components/modal/CreatePostModal";
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

  return (
    <>
      <div className="bg-white rounded-2xl border border-black/10 p-4 w-full mx-auto">
        <div className="flex items-center space-x-3">
          <Avatar
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            className="select-none cursor-pointer"
          />

          <div
            onClick={() => setIsOpen(true)}
            className="bg-gray-200 text-gray-500 rounded-full px-4 py-2 w-full 
            cursor-pointer hover:bg-gray-200 transition select-none"
          >
            What&apos;s on your mind, Doe?
          </div>
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-3 px-2 text-sm text-gray-500">
          {activities.map((activity) => (
            <div
              key={activity.key}
              className="flex items-center justify-center gap-2 p-2 hover:bg-black/10 
            rounded-sm transition-all cursor-pointer"
            >
              {activity.icon}
              <span>{activity.content}</span>
            </div>
          ))}
        </div>
      </div>

      <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default CreatePost;
