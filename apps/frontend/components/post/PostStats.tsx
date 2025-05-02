"use client";
import { Heart } from "lucide-react";

const PostStats = () => {
  return (
    <div className="flex items-center px-4 py-2 justify-between">
      <div className="flex items-center gap-1">
        <Heart size={20} />

        <div className="flex items-center text-sm">
          <span className="font-semibold text-gray-900 hover:underline hover:cursor-pointer">
            Lana Nguyen
          </span>
          <span className="mx-1 text-gray-600">and</span>
          <span className="font-semibold text-gray-900 hover:underline hover:cursor-pointer">
            2.2K others
          </span>
        </div>
      </div>

      <div className="flex items-center mt-1 text-sm text-gray-600">
        <span>121 comments</span>
        <span className="mx-2">•</span>
        <span>16 shares</span>
      </div>
    </div>
  );
};

export default PostStats;
