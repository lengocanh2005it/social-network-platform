import PostIcon from "@/components/ui/icons/post";
import StoryIcon from "@/components/ui/icons/story";
import { formatRelativeTime, ReportsDashboardType } from "@/utils";
import { Button, Chip } from "@heroui/react";
import { ReportTypeEnum } from "@repo/db";
import { CheckIcon } from "lucide-react";
import React from "react";

interface ReportCardHeaderProps {
  report: ReportsDashboardType;
  handleResolve: () => void;
}

const ReportCardHeader: React.FC<ReportCardHeaderProps> = ({
  report,
  handleResolve,
}) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 
    bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b dark:border-gray-700"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-xs">
          {report.type === ReportTypeEnum.post ? (
            <PostIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <StoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {report.type === ReportTypeEnum.post
              ? "Post Report"
              : "Story Report"}
            <span className="hidden sm:inline-flex">
              <Chip
                size="sm"
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
              >
                ID: {report.targetId.slice(0, 6)}
              </Chip>
            </span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reported{" "}
            {formatRelativeTime(
              report.reports[0].created_at as unknown as string,
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="sm:hidden">
          <Chip
            size="sm"
            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
          >
            ID: {report.targetId.slice(0, 6)}
          </Chip>
        </div>

        <Chip
          size="sm"
          color="warning"
          className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
        >
          {report.count} {report.count > 1 ? "reports" : "report"}
        </Chip>

        <Button
          onPress={handleResolve}
          size="sm"
          variant="solid"
          color="success"
          className="shadow-sm hover:shadow-md transition-all min-w-[100px] dark:text-white"
          startContent={<CheckIcon className="w-4 h-4" />}
        >
          Resolve
        </Button>
      </div>
    </div>
  );
};

export default ReportCardHeader;
