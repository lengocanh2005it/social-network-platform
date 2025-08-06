import GlobalIcon from "@/components/ui/icons/global";
import { PostDetails } from "@/store";
import { formatDateTime } from "@/utils";
import { Avatar } from "@heroui/react";
import { PostPrivaciesEnum } from "@repo/db";
import { Lock, Users } from "lucide-react";
import React from "react";
import Image from "next/image";

interface ParentPostDetailsProps {
  parentPost: PostDetails;
  onClick: () => void;
}

const ParentPostDetails: React.FC<ParentPostDetailsProps> = ({
  parentPost,
  onClick,
}) => {
  return (
    <div
      className="p-6 border border-black/10 dark:border-white/20 rounded-lg md:mb-3 mb-2"
      onClick={onClick}
    >
      <div className="flex items-center mb-3 gap-2">
        <Avatar
          src={parentPost.user.profile.avatar_url}
          alt={
            parentPost.user.profile.first_name +
            " " +
            parentPost.user.profile.last_name
          }
          className="object-cover cursor-pointer select-none flex-shrink-0"
        />

        <div className="flex flex-col relative">
          <h4 className="font-semibold">
            {parentPost.user.profile.first_name +
              " " +
              parentPost.user.profile.last_name}
          </h4>

          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-white/80">
            <span className="leading-none">
              {formatDateTime(new Date(parentPost.created_at))}
            </span>

            {parentPost.privacy === PostPrivaciesEnum.only_friend ? (
              <Users
                width={16}
                height={16}
                className="inline-block align-middle"
              />
            ) : parentPost.privacy === PostPrivaciesEnum.only_me ? (
              <Lock
                width={16}
                height={16}
                className="inline-block align-middle"
              />
            ) : (
              <GlobalIcon width={16} height={16} />
            )}
          </div>
        </div>
      </div>

      {(parentPost?.contents?.length !== 0 ||
        parentPost?.hashtags?.length !== 0) && (
        <section className="flex flex-col md:gap-2 gap-1 relative">
          {parentPost?.contents?.length !== 0 && (
            <div className="flex flex-col relative md:gap-2 gap-1 text-black/80 dark:text-white/80">
              {parentPost.contents.map((ct) => (
                <p className="text-sm whitespace-pre-wrap" key={ct.id}>
                  {ct.content}
                </p>
              ))}
            </div>
          )}

          {parentPost?.hashtags?.length !== 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {parentPost.hashtags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs cursor-pointer text-blue-500 bg-blue-100 
                  px-2 py-0.5 rounded-full"
                >
                  #{tag.hashtag}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {parentPost?.images?.length !== 0 && (
        <>
          <div
            className={`grid gap-3 md:mt-3 mt-2 ${
              parentPost?.images.length === 1
                ? "grid-cols-1"
                : parentPost?.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {parentPost?.images?.map((image) => (
              <div
                key={image.id}
                className="relative w-full aspect-[4/3] overflow-hidden rounded-md"
              >
                <Image
                  src={image.image_url}
                  alt="post"
                  fill
                  priority
                  sizes="100vw"
                  className="select-none"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentPostDetails;
