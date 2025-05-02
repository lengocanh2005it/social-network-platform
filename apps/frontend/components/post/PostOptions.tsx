"use client";
import { MessageCircle, Share2, ThumbsUpIcon } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

interface PostOptionsProps {
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
}

const PostOptions: React.FC<PostOptionsProps> = ({ setIsOpen }) => {
  return (
    <div
      className="grid grid-cols-3 gap-4 text-gray-600 border-t
   border-black/10 pt-2 mt-2 text-xl"
    >
      <div
        className="flex justify-center cursor-pointer items-center 
    gap-2 p-3 rounded-lg hover:bg-gray-100 transition-all duration-250 ease-in select-none"
      >
        <ThumbsUpIcon size={20} />

        <p className="text-md">Like</p>
      </div>

      {setIsOpen ? (
        <div
          className="flex justify-center cursor-pointer items-center 
    gap-2 p-3 rounded-lg hover:bg-gray-100 transition-all duration-250 ease-in select-none"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={20} />

          <p className="text-md">Comment</p>
        </div>
      ) : (
        <div
          className="flex justify-center cursor-pointer items-center 
    gap-2 p-3 rounded-lg hover:bg-gray-100 transition-all duration-250 ease-in select-none"
        >
          <MessageCircle size={20} />

          <p className="text-md">Comment</p>
        </div>
      )}

      <div
        className="flex justify-center cursor-pointer items-center 
    gap-2 p-3 rounded-lg hover:bg-gray-100 transition-all duration-250 ease-in select-none"
      >
        <Share2 size={20} />

        <p className="text-md">Share</p>
      </div>
    </div>
  );
};

export default PostOptions;
