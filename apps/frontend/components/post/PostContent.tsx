"use client";
import ViewPostModal from "@/components/modal/ViewPostModal";
import ParentPostDetails from "@/components/post/ParentPostDetails";
import PostMediaItem from "@/components/post/PostMediaItem";
import { PostDetails } from "@/store";
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";

interface PostContentProps {
  homePost: PostDetails;
}

const PostContent: React.FC<PostContentProps> = ({ homePost }) => {
  const [isShowParentPostModal, setIsShowParentPostModal] =
    useState<boolean>(false);

  return (
    <section className="flex flex-col relative md:pb-2 pb-1">
      {(homePost?.contents?.length !== 0 ||
        homePost?.hashtags?.length !== 0) && (
        <section className="flex flex-col md:gap-2 gap-1 relative">
          {homePost?.contents?.length !== 0 && (
            <div className="flex flex-col relative md:gap-2 gap-1 text-black/80 dark:text-white/90">
              {homePost.contents.map((ct) => (
                <p className="text-sm whitespace-pre-wrap" key={ct.id}>
                  {ct.content}
                </p>
              ))}
            </div>
          )}

          {homePost?.hashtags?.length !== 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {homePost.hashtags.map((tag) => (
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

      {homePost?.images?.length > 0 && (
        <PostMediaItem post={homePost} images={homePost.images} />
      )}

      {homePost?.parent_post_id && (
        <>
          {homePost?.parent_post ? (
            <>
              <ParentPostDetails
                parentPost={homePost.parent_post}
                onClick={() => setIsShowParentPostModal(true)}
              />
            </>
          ) : (
            <>
              <div
                className="p-6 flex flex-col items-center justify-center
              text-center border border-black/10 dark:border-white/20
              rounded-lg gap-2 md:mb-3 mb-2 mt-3"
              >
                <AlertTriangle className="text-yellow-500 w-10 h-10 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This content is no longer available. It may have been removed
                  by an admin or the user who shared it.
                </p>
              </div>
            </>
          )}
        </>
      )}

      {isShowParentPostModal && homePost.parent_post && (
        <ViewPostModal
          homePost={homePost.parent_post}
          isOpen={isShowParentPostModal}
          setIsOpen={setIsShowParentPostModal}
        />
      )}
    </section>
  );
};

export default PostContent;
