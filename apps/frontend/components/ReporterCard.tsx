import {
  formatRelativeTime,
  reasonReportOptions,
  ReportsDashboardDetailsType,
} from "@/utils";
import { Avatar, Tooltip } from "@heroui/react";
import React from "react";

interface ReporterCardProps {
  reportDetail: ReportsDashboardDetailsType;
}

const ReporterCard: React.FC<ReporterCardProps> = ({ reportDetail }) => {
  const fullName = `${reportDetail.reporter.profile.first_name} ${reportDetail.reporter.profile.last_name}`;
  const username = `@${reportDetail.reporter.profile.username}`;
  const reasonReportMap = Object.fromEntries(
    reasonReportOptions.map((item) => [item.key, item.label]),
  );

  return (
    <div
      className="relative p-3 flex items-center w-full gap-3 rounded-lg
    hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200"
    >
      <Tooltip
        content={
          <div className="flex flex-col p-2">
            <p className="font-medium">{fullName}</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {username}
            </p>
          </div>
        }
        placement="left"
      >
        <Avatar
          src={reportDetail.reporter.profile.avatar_url}
          alt={fullName}
          className="w-10 h-10 flex-shrink-0 select-none object-cover 
            cursor-pointer"
        />
      </Tooltip>

      <div className="flex-1 min-w-0">
        <div
          className="px-3 py-2 bg-white dark:border-gray-700 dark:text-white
           dark:bg-black/60 rounded-lg transition-all duration-200"
        >
          <p className="text-sm line-clamp-2">
            {reasonReportMap[reportDetail.reason]}
          </p>
          <p className="text-xs text-right text-black/70 dark:text-gray-400">
            {formatRelativeTime(reportDetail.created_at as unknown as string)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReporterCard;
