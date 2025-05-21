"use client";
import { Post } from "@/utils";
import { Heart } from "lucide-react";
import React from "react";

interface PostStatsProps {
  homePost: Post;
}

const PostStats: React.FC<PostStatsProps> = ({ homePost }) => {
  return (
    <div
      className={`flex items-center px-4 py-2 ${
        homePost.total_likes > 0 ? "justify-between" : "justify-end"
      }`}
    >
      {homePost.total_likes > 0 && (
        <div className="flex items-center gap-1">
          <Heart size={20} />

          <div className="flex items-center text-sm">
            <span className="font-semibold text-gray-900 hover:underline hover:cursor-pointer">
              {homePost.user.profile.first_name +
                " " +
                homePost.user.profile.last_name}
            </span>

            {homePost.total_likes > 1 && (
              <>
                <span className="mx-1 text-gray-600">and</span>
                <span className="font-semibold text-gray-900 hover:underline hover:cursor-pointer">
                  {homePost.total_likes} others
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {(homePost.total_comments > 0 || homePost.total_shares > 0) && (
        <>
          <div className="flex items-center mt-1 text-sm text-gray-600">
            {homePost.total_comments > 0 && (
              <span>{homePost.total_comments} comments</span>
            )}

            {homePost.total_shares > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>{homePost.total_shares} shares</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PostStats;
