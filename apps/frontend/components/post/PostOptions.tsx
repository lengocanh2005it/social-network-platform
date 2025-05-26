"use client";
import ViewLikedUsersDetaiModal from "@/components/modal/ViewLikedUsersDetaiModal";
import { useLikePost, useUnlikePost } from "@/hooks";
import { PostDetails, usePostStore } from "@/store";
import { MessageCircle, Share2, ThumbsUpIcon } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

interface PostOptionsProps {
  post: PostDetails;
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
}

const PostOptions: React.FC<PostOptionsProps> = ({ setIsOpen, post }) => {
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [totalLikes, setTotalLikes] = useState(post.total_likes);
  const { mutate: mutateLikePost } = useLikePost();
  const { mutate: mutateUnlikePost } = useUnlikePost();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { updatePost } = usePostStore();

  useEffect(() => {
    setTotalLikes(post.total_likes);
  }, [post, setTotalLikes]);

  useEffect(() => {
    if (post && post?.likedByCurrentUser) {
      setLiked(true);
    } else setLiked(false);
  }, [post, setLiked]);

  const renderLikedUsersText = () => {
    const likes = typeof totalLikes === "number" ? totalLikes : 0;

    const users = post.topLikedUsers ?? [];

    const displayed = users.slice(0, 3).map((u) => u.full_name);

    const othersCount = likes - users.length;

    if (othersCount <= 0) {
      return displayed.join(", ");
    }

    return `${displayed.join(", ")} and ${othersCount} other${othersCount > 1 ? "s" : ""}`;
  };

  const toggleLike = () => {
    if (liked) {
      mutateUnlikePost(post.id, {
        onSuccess(data) {
          if (data) {
            setLiked(false);
            setTotalLikes(data.post.total_likes);
            updatePost(post.id, data.post);
          }
        },
      });
    } else {
      mutateLikePost(post.id, {
        onSuccess(data) {
          setLiked(true);
          setTotalLikes(data.post.total_likes);
          updatePost(post.id, data.post);
        },
      });
    }
  };

  return (
    <>
      <div
        className={`flex flex-col relativ md:gap-3 gap-2 border-t border-black/10 
          ${!setIsOpen && "pb-2"} ${post.topLikedUsers?.length !== 0 ? "pt-3" : "pt-2"}`}
      >
        <div className="flex items-center justify-between md:gap-3 gap-2">
          <p
            className="text-sm text-gray-600 text-left hover:underline cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {renderLikedUsersText()}
          </p>

          {(post?.total_comments !== 0 || post?.total_shares !== 0) && (
            <div className="flex items-center justify-center md:gap-2 gap-1">
              {post?.total_comments !== 0 && (
                <p className="text-sm text-gray-600 text-left hover:underline cursor-pointer">
                  {post?.total_comments}{" "}
                  {post?.total_comments > 1 ? "comments" : "comment"}
                </p>
              )}

              {post?.total_shares !== 0 && (
                <p className="text-sm text-gray-600 text-left hover:underline cursor-pointer">
                  {post?.total_shares}{" "}
                  {post?.total_shares > 1 ? "shares" : "share"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-gray-600">
          <div
            className={`flex justify-center cursor-pointer items-center gap-2 p-3 
          rounded-lg transition-all duration-250 ease-in select-none ${
            liked ? "text-blue-600 hover:bg-blue-100" : "hover:bg-gray-100"
          }`}
            onClick={toggleLike}
          >
            <ThumbsUpIcon
              size={20}
              fill={liked ? "blue" : "none"}
              stroke={liked ? "blue" : "currentColor"}
            />
            <p className="text-md">{liked ? "Liked" : "Like"}</p>
          </div>

          {setIsOpen ? (
            <div
              className="flex justify-center cursor-pointer items-center gap-2 p-3 rounded-lg
           hover:bg-gray-100 transition-all duration-250 ease-in select-none"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle size={20} />
              <p className="text-md">Comment</p>
            </div>
          ) : (
            <div
              className="flex justify-center cursor-pointer items-center gap-2 
        p-3 rounded-lg hover:bg-gray-100 transition-all duration-250 ease-in select-none"
            >
              <MessageCircle size={20} />
              <p className="text-md">Comment</p>
            </div>
          )}

          <div
            className="flex justify-center cursor-pointer items-center gap-2 
      p-3 rounded-lg hover:bg-gray-100 transition-all duration-250 ease-in select-none"
          >
            <Share2 size={20} />
            <p className="text-md">Share</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ViewLikedUsersDetaiModal
          post={post}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
      )}
    </>
  );
};

export default PostOptions;
