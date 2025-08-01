import { ScrollArea } from "@/components/ui/scroll-area";
import { BookMark } from "@/utils";
import { Avatar, Tooltip } from "@heroui/react";
import { format } from "date-fns";
import {
  BookmarkIcon,
  ClockIcon,
  HeartIcon,
  MessageSquareIcon,
  Share2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface BookMarksListProps {
  bookMarks: BookMark[];
}

const BookMarksList: React.FC<BookMarksListProps> = ({ bookMarks }) => {
  const router = useRouter();

  const handleViewPostDetails = (bookMark: BookMark) => {
    router.push(
      `/${bookMark.post.user.profile.username}/posts/${bookMark.post.id}`,
    );
  };

  return (
    <ScrollArea className="h-[350px] w-full">
      {bookMarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer
          dark:hover:bg-white/20 dark:text-white text-black"
          onClick={() => handleViewPostDetails(bookmark)}
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={bookmark.post.user.profile.avatar_url}
              alt={`${bookmark.post.user.profile.first_name} ${bookmark.post.user.profile.last_name}`}
              className="w-8 h-8"
            />
            <div>
              <p className="text-sm font-medium">
                {bookmark.post.user.profile.first_name}{" "}
                {bookmark.post.user.profile.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/70 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {format(new Date(bookmark.post.created_at), "dd/MM/yyyy")}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-800 dark:text-white/80 max-w-[300px] truncate">
              {bookmark?.post?.contents.map((c) => c.content).join(" ")}
            </p>

            {bookmark?.post?.hashtags?.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {bookmark.post.hashtags.map((tag) => (
                  <span key={tag.id} className="text-xs text-blue-500">
                    #{tag.hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {bookmark?.post?.images?.length > 0 && (
            <img
              src={bookmark.post.images[0].image_url}
              alt="Post content"
              className="w-full h-40 object-cover rounded-md mb-3 flex-shrink-0 select-none"
            />
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/70">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <HeartIcon className="w-3 h-3" />
                {bookmark.post.total_likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquareIcon className="w-3 h-3" />
                {bookmark.post.total_comments}
              </span>
              <span className="flex items-center gap-1">
                <Share2Icon className="w-3 h-3" />
                {bookmark.post.total_shares}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip
                content={`Saved at ${format(bookmark.saved_at, "dd/MM/yyyy HH:mm:ss")}`}
                delay={2000}
              >
                <span className="text-yellow-500">
                  <BookmarkIcon className="w-4 h-4 fill-current" />
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default BookMarksList;
