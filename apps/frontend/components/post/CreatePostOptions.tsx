import UploadMediaButton from "@/components/button/UploadMediaButton";
import TagFriendsModal from "@/components/modal/TagFriendsModal";
import { PostDetails } from "@/store";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import {
  Ellipsis,
  Flag,
  SmileIcon,
  UserPlus,
  Video,
  WandSparkles,
} from "lucide-react";
import React, { useState } from "react";

interface CreatePostOptionsProps {
  post?: PostDetails;
}

const CreatePostOptions: React.FC<CreatePostOptionsProps> = ({ post }) => {
  const [isShowTagPeopleModal, setIsShowTagPeopleModal] =
    useState<boolean>(false);

  const options = [
    {
      key: 1,
      icon: <UploadMediaButton />,
      content: "Photo/video",
    },
    {
      key: 2,
      icon: (
        <UserPlus
          className="focus:outline-none"
          onClick={() => setIsShowTagPeopleModal(true)}
        />
      ),
      content: "Tag people",
    },
    {
      key: 3,
      icon: <SmileIcon className="focus:outline-none" />,
      content: "Feeling/activity",
    },
    {
      key: 4,
      icon: <Video className="focus:outline-none" />,
      content: "Video",
    },
    {
      key: 5,
      icon: <WandSparkles className="focus:outline-none" />,
      content: "GIF",
    },
  ];

  return (
    <>
      <div
        className="w-full flex items-center justify-between px-4 py-2 border
     border-black/10 rounded-lg"
      >
        <p className="text-sm text-gray-700">Add to your post</p>

        <div className="flex items-center md:gap-3 gap-2">
          <div className="flex items-center md:gap-3 gap-2">
            {options.map((option) => (
              <div
                key={option.key}
                className="focus:outline-none cursor-pointer"
              >
                <Tooltip content={option.content}>{option.icon}</Tooltip>
              </div>
            ))}
          </div>

          <Dropdown className="text-black" shouldBlockScroll={false}>
            <DropdownTrigger>
              <div>
                <Tooltip content="More">
                  <Ellipsis
                    size={30}
                    className="cursor-pointer focus:outline-none"
                  />
                </Tooltip>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Create Post Options" variant="flat">
              <DropdownItem key="live-video" startContent={<Video />}>
                Live video
              </DropdownItem>
              <DropdownItem key="life-event" startContent={<Flag />}>
                Life event
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {isShowTagPeopleModal && (
        <TagFriendsModal
          setIsShowTagPeopleModal={setIsShowTagPeopleModal}
          isShowTagPeopleModal={isShowTagPeopleModal}
          post={post}
        />
      )}
    </>
  );
};

export default CreatePostOptions;
