"use client";
import TagFriendsModal from "@/components/modal/TagFriendsModal";
import { PostDetails, useUserStore } from "@/store";
import { Avatar, AvatarGroup, Tooltip } from "@heroui/react";
import React, { useEffect, useState } from "react";

interface TaggedUserPostsProps {
  post?: PostDetails;
}

const TaggedUserPosts: React.FC<TaggedUserPostsProps> = ({ post }) => {
  const { selectedTaggedUsers, setTotalTaggedUsers, totalTaggedUsers } =
    useUserStore();
  const [isShowTagPeopleModal, setIsShowTagPeopleModal] =
    useState<boolean>(false);

  useEffect(() => {
    if (post?.total_tagged_users) setTotalTaggedUsers(post.total_tagged_users);
  }, [post, setTotalTaggedUsers]);

  return (
    <>
      <div className="flex items-center justify-end md:gap-4 gap-3 p-2">
        <p className="text-sm text-gray-600 dark:text-white/80">with</p>

        <AvatarGroup
          isBordered
          onClick={() => setIsShowTagPeopleModal(true)}
          max={3}
          renderCount={(count) => (
            <p className="text-small text-foreground font-medium ms-2">
              +{count} others
            </p>
          )}
          total={totalTaggedUsers - 3}
        >
          {selectedTaggedUsers.map((st) => (
            <div key={st.user_id} className="relative">
              <Tooltip content={st.full_name}>
                <Avatar
                  src={st.avatar_url}
                  alt={st.full_name}
                  className="select-none flex-shrink-0 cursor-pointer"
                />
              </Tooltip>
            </div>
          ))}
        </AvatarGroup>
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

export default TaggedUserPosts;
