"use client";
import { ReportsDashboardType } from "@/utils";
import { Avatar, Badge } from "@heroui/react";
import { formatDate } from "date-fns";
import React from "react";

interface ReportStoryDetailsProps {
  report: ReportsDashboardType;
}

const ReportStoryDetails: React.FC<ReportStoryDetailsProps> = ({ report }) => {
  return (
    <>
      {report?.story ? (
        <>
          <div
            className="border dark:border-gray-700 rounded-lg p-4 mt-3 bg-white 
                dark:bg-gray-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={report.story.user.avatar_url}
                alt={report.story.user.full_name}
                size="sm"
              />
              <div>
                <p className="font-medium dark:text-white">
                  {report.story.user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(report.story.created_at, "PPpp")}
                </p>
              </div>
            </div>

            {report.story.text_content && (
              <p className="my-3 text-gray-800 dark:text-gray-200">
                {report.story.text_content}
              </p>
            )}

            {report.story.content_url && (
              <div className="mt-3 rounded-lg overflow-hidden">
                {report.story.content_type === "image" ? (
                  <img
                    src={report.story.content_url}
                    alt="Story content"
                    className="w-full max-h-96 object-contain"
                  />
                ) : (
                  <video
                    src={report.story.content_url}
                    controls
                    className="w-full max-h-96"
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {report.story.total_views} views
              </span>
              <Badge>{report.story.status}</Badge>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default ReportStoryDetails;
