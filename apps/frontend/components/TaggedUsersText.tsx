import React from "react";

interface TaggedUser {
  username: string;
  full_name: string;
}

interface Props {
  taggedUsers: TaggedUser[];
  totalTaggedUsers: number;
  onViewProfile: (username: string) => void;
  onOpenModal: () => void;
}

export const TaggedUsersText: React.FC<Props> = ({
  taggedUsers,
  totalTaggedUsers,
  onViewProfile,
  onOpenModal,
}) => {
  if (taggedUsers.length === 0) return null;

  return (
    <div className="relative text-sm">
      <span className="text-gray-600 dark:text-white/80">with</span>{" "}
      <span
        className="hover:underline cursor-pointer"
        onClick={() => onViewProfile(taggedUsers[0].username)}
      >
        {taggedUsers[0].full_name}
      </span>
      {totalTaggedUsers > 1 && (
        <>
          <span className="text-gray-600 dark:text-white/80"> and </span>
          <span
            className="hover:underline cursor-pointer"
            onClick={onOpenModal}
          >
            {`${totalTaggedUsers - 1} other${totalTaggedUsers > 2 ? "s" : ""}`}
          </span>
        </>
      )}
    </div>
  );
};
