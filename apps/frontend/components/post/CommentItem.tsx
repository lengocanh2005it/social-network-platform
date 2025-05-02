"use client";
import { Avatar } from "@heroui/react";
import React from "react";

export interface CommentType {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  replies?: CommentType[];
}

interface CommentItemProps {
  comment: CommentType;
  level?: number;
  hasSibling?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, level = 0 }) => {
  return (
    <div className="relative" style={{ marginLeft: level > 0 ? 24 : 0 }}>
      <div className="flex gap-2">
        <div className="relative flex-shrink-0">
          <Avatar
            src={comment.avatar}
            alt={comment.author}
            className="select-none cursor-pointer"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 p-2 rounded-lg max-w-fit overflow-hidden">
            <p className="font-bold truncate">{comment.author}</p>
            <p className="text-black/80 break-words whitespace-pre-wrap max-w-[600px]">
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{comment.time}</span>
            <button className="cursor-pointer hover:text-gray-700">Like</button>
            <button className="cursor-pointer hover:text-gray-700">
              Reply
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2">
        {comment.replies?.map((reply, index) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            level={level + 1}
            hasSibling={index < comment.replies!.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentItem;
