import PostMediaItem from "@/components/post/PostMediaItem";
import { ReportsDashboardType } from "@/utils";
import { Avatar, Tooltip } from "@heroui/react";
import { formatDate } from "date-fns";
import { HeartIcon, MessageSquareIcon, Share2Icon } from "lucide-react";
import React from "react";

interface ReportPostDetailsProps {
  report: ReportsDashboardType;
}

const ReportPosDetails: React.FC<ReportPostDetailsProps> = ({ report }) => {
  const reactions = [
    {
      id: 1,
      title: "Total likes",
      icon: <HeartIcon className="w-4 h-4 mr-1" />,
      value: report.post?.total_likes ?? 0,
    },
    {
      id: 2,
      title: "Total comments",
      icon: <MessageSquareIcon className="w-4 h-4 mr-1" />,
      value: report.post?.total_comments ?? 0,
    },
    {
      id: 3,
      title: "Total shares",
      icon: <Share2Icon className="w-4 h-4 mr-1" />,
      value: report.post?.total_shares ?? 0,
    },
  ];

  return (
    <>
      {report?.post ? (
        <>
          <div
            className="border dark:border-gray-700 rounded-lg p-4 mt-3 bg-white 
          dark:bg-gray-800 shadow-sm"
          >
            <div
              className="flex items-center gap-3 mb-3 pb-3 border-b 
            border-gray-100 dark:border-gray-700"
            >
              <Avatar
                src={report.post.user.profile.avatar_url}
                alt={report.post.user.profile.first_name}
                size="sm"
                className="cursor-pointer select-none flex-shrink-0"
              />
              <div className="flex flex-col relative w-full flex-1">
                <p className="font-medium dark:text-white">
                  {report.post.user.profile.first_name +
                    " " +
                    report.post.user.profile.last_name}
                </p>
                <div className="flex items-center gap-1 justify-between">
                  <p className="text-xs text-black/70 dark:text-white/60">
                    @{report.post.user.profile.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(report.post.created_at, "PPpp")}
                  </p>
                </div>
              </div>
            </div>

            {report.post.contents.length > 0 && (
              <div className="my-3 space-y-2">
                {report.post.contents.map((content) => (
                  <p
                    key={content.id}
                    className="text-gray-800 dark:text-gray-200 break-words"
                  >
                    {content.content}
                  </p>
                ))}
              </div>
            )}

            {report.post.images.length > 0 && (
              <PostMediaItem images={report.post.images} post={report.post} />
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
              <div className="flex space-x-4 text-sm">
                {reactions.map((re) => (
                  <Tooltip key={re.id} content={re.title}>
                    <span
                      className="flex items-center text-gray-500 dark:text-gray-400
                  cursor-pointer opacity-70 hover:opacity-100 duration-250 ease-in-out transition-all"
                    >
                      {re.icon}
                      {re.value}
                    </span>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ReportPosDetails;
