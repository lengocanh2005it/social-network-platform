"use client";
import PostOptions from "@/components/post/PostOptions";
import GlobalIcon from "@/components/ui/icons/global";
import { useUserStore } from "@/store";
import { Post } from "@/utils";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  Camera,
  Ellipsis,
  EyeOff,
  SmileIcon,
  Star,
  Sticker,
  Trash,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import React from "react";

interface ProfilePostsProps {
  post: Post;
}

const icons = [
  {
    key: 1,
    icon: <Star className="w-5 h-5" />,
    label: "",
  },
  {
    key: 2,
    icon: <SmileIcon className="w-5 h-5" />,
    label: "",
  },
  {
    key: 3,
    icon: <Camera className="w-5 h-5" />,
    label: "",
  },
  {
    key: 4,
    icon: <WandSparkles className="w-5 h-5" />,
    label: "",
  },
  {
    key: 5,
    icon: <Sticker className="w-5 h-5" />,
    label: "",
  },
];

const ProfilePosts: React.FC<ProfilePostsProps> = ({ post }) => {
  const { user } = useUserStore();

  return (
    <>
      {user && (
        <>
          <div className="bg-white border border-black/10 rounded-xl mb-6 p-4">
            <div className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center mb-3 gap-2">
                  <Avatar
                    src={post.avatar}
                    alt={post.author}
                    className="object-cover cursor-pointer select-none"
                  />

                  <div className="flex flex-col relative">
                    <h4 className="font-semibold">{post.author}</h4>

                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">{post.time}</span>
                      <GlobalIcon width={20} height={20} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center md:gap-3 gap-2">
                  <Dropdown
                    placement="bottom-end"
                    className="text-black"
                    shouldBlockScroll={false}
                  >
                    <DropdownTrigger>
                      <Ellipsis
                        size={30}
                        className="cursor-pointer focus:outline-none"
                      />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="" variant="flat">
                      <DropdownItem key="hide-post" startContent={<EyeOff />}>
                        Hide post
                      </DropdownItem>
                      <DropdownItem key="delete-post" startContent={<Trash />}>
                        Delete post
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

              {post.isShared && post.originalPost && (
                <div className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src={post.originalPost.avatar}
                      alt={post.originalPost.author}
                      size="sm"
                    />

                    <div className="flex flex-col relative">
                      <h4 className="font-semibold">
                        {post.originalPost.author}
                      </h4>

                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">
                          {post.originalPost.time}
                        </span>
                        <GlobalIcon width={20} height={20} />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {post.originalPost.content}
                  </p>

                  {post.originalPost.image && (
                    <div className="relative w-full min-h-[400px] max-h-[600px]">
                      <Image
                        src={post.originalPost.image}
                        alt="post"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-md mb-3 select-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {post.image && !post.isShared && (
                <div className="relative w-full min-h-[400px] max-h-[600px]">
                  <Image
                    src={post.image}
                    alt="post"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-md mb-3 select-none"
                  />
                </div>
              )}

              <PostOptions />

              <div className="flex items-center justify-between md:gap-2 gap-1 mt-2">
                <Avatar
                  src={user.profile.avatar_url}
                  alt={user.profile.first_name + " " + user.profile.last_name}
                  className="object-cover cursor-pointer select-none"
                />

                <div className="flex justify-between w-full bg-gray-100 rounded-xl p-3">
                  <textarea
                    rows={1}
                    placeholder="Write a comment..."
                    className="w-full bg-transparent resize-none focus:outline-none text-sm"
                  />

                  <div className="flex items-center gap-2">
                    {icons.map((icon) => (
                      <button
                        className="text-gray-500 hover:text-gray-700 transition-all cursor-pointer"
                        key={icon.key}
                      >
                        {icon.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProfilePosts;
