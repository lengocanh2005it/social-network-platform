import ViewReportersOfReportModal from "@/components/modal/ViewReportersOfReportModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { reasonReportOptions, ReportsDashboardType } from "@/utils";
import { Avatar } from "@heroui/react";
import { formatDate } from "date-fns";
import { FlagIcon } from "lucide-react";
import React, { useState } from "react";

interface ReportCardDetailsProps {
  report: ReportsDashboardType;
}

const ReportCardDetails: React.FC<ReportCardDetailsProps> = ({ report }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const reasonReportMap = Object.fromEntries(
    reasonReportOptions.map((item) => [item.key, item.label]),
  );

  const handleClickViewDetails = () => setIsOpen(true);

  return (
    <div className="mt-6 relative">
      <div
        className="relative flex items-center justify-between flex-1
      border-b border-b-black/20 dark:border-b-gray-700 pb-1"
      >
        <div className="flex items-center md:gap-2 gap-1 relative">
          <FlagIcon className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          <h3 className="font-semibold text-medium text-gray-900 dark:text-gray-100">
            Report Details
          </h3>
        </div>

        <p
          className="underline text-blue-500 dark:text-blue-600
        cursor-pointer hover:text-blue-600 dark:hover:text-blue-700
        transition-all ease-in-out duration-250"
          onClick={handleClickViewDetails}
        >
          See Details
        </p>
      </div>

      <ScrollArea className="h-[100px] mt-2">
        <div className="space-y-2">
          {report.reports.map((detail) => (
            <div
              key={detail.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 
            dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <Avatar
                  src={detail.reporter.profile.avatar_url}
                  alt={`${detail.reporter.profile.first_name} ${detail.reporter.profile.last_name}`}
                  size="md"
                  className="ring-2 ring-white dark:ring-gray-800"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {detail.reporter.profile.first_name +
                          " " +
                          detail.reporter.profile.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        @{detail.reporter.profile.username}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(detail.created_at, "MMM d, h:mm a")}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reasonReportMap[detail.reason]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {isOpen && (
        <ViewReportersOfReportModal
          report={report}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </div>
  );
};

export default ReportCardDetails;
