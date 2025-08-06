"use client";
import TaggedUserPosts from "@/components/TaggedUserPosts";
import GlobalIcon from "@/components/ui/icons/global";
import { PostDetails, useUserStore } from "@/store";
import { Avatar, Select, Selection, SelectItem } from "@heroui/react";
import { PostPrivaciesType } from "@repo/db";
import { Lock, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CreatePostHeaderProps {
  onChange?: (key: PostPrivaciesType) => void;
  privacy: PostPrivaciesType;
  post?: PostDetails;
}

const privacies = [
  {
    key: "only_me",
    label: "Only me",
    icon: <Lock className="w-4 h-4" />,
  },
  {
    key: "only_friend",
    label: "Only friends",
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: "public",
    label: "Public",
    icon: <GlobalIcon width={29} height={20} />,
  },
];

const CreatePostHeader: React.FC<CreatePostHeaderProps> = ({
  onChange,
  privacy,
  post,
}) => {
  const { user, selectedTaggedUsers } = useUserStore();
  const [selectedKey, setSelectedKey] = useState<Set<PostPrivaciesType>>(
    new Set([privacy]),
  );

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;

    const newKeySet = new Set(keys as Set<PostPrivaciesType>);

    setSelectedKey(newKeySet);

    const selected = Array.from(newKeySet)[0];

    onChange?.(selected);
  };

  useEffect(() => {
    if (!selectedKey.size) {
      setSelectedKey(new Set([privacy]));
    }
  }, [selectedKey, privacy]);

  return (
    <>
      {user && (
        <div className="flex items-center gap-3">
          <Avatar
            src={user.profile.avatar_url}
            className="select-none flex-shrink-0 w-10 h-10"
          />

          <div className="flex items-end justify-between w-full">
            <div className="flex flex-col gap-1 w-[170px]">
              <h3 className="text-sm text-gray-900 dark:text-white/80">
                {user.profile.first_name + " " + user.profile.last_name}
              </h3>

              <Select
                size="sm"
                defaultSelectedKeys={[privacy]}
                aria-labelledby="privacies"
                aria-label="privacies"
                className="text-sm"
                selectedKeys={selectedKey ?? []}
                onSelectionChange={handleSelectionChange}
                renderValue={(selected) => {
                  const item = Array.from(selected)[0];

                  const selectedKey =
                    typeof item === "string" ? item : (item?.key ?? "");

                  const selectedPrivacy = privacies.find(
                    (p) => p.key === selectedKey,
                  );

                  if (!selectedPrivacy) return null;

                  return (
                    <div className="flex items-center gap-2 text-sm">
                      {selectedPrivacy.icon}
                      {selectedPrivacy.label}
                    </div>
                  );
                }}
              >
                {privacies.map((privacy) => (
                  <SelectItem startContent={privacy.icon} key={privacy.key}>
                    {privacy.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {selectedTaggedUsers?.length > 0 && <TaggedUserPosts post={post} />}
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePostHeader;
