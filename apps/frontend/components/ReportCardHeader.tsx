import ConfirmModal from "@/components/modal/ConfirmModal";
import PostIcon from "@/components/ui/icons/post";
import StoryIcon from "@/components/ui/icons/story";
import { useUpdateReportStatus } from "@/hooks";
import {
  formatRelativeTime,
  ReportsDashboardType,
  UpdateReportStatusDto,
} from "@/utils";
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { ReportStatusEnum, ReportTypeEnum } from "@repo/db";
import { capitalize } from "lodash";
import { CheckIcon, Ellipsis, XIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface ReportCardHeaderProps {
  report: ReportsDashboardType;
  setReports: React.Dispatch<React.SetStateAction<ReportsDashboardType[]>>;
}

const ReportCardHeader: React.FC<ReportCardHeaderProps> = ({
  report,
  setReports,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const { isPending, mutate: mutateUpdateReportStatus } =
    useUpdateReportStatus();
  const statusColors = {
    pending: "bg-yellow-500",
    resolved: "bg-green-500",
    rejected: "bg-red-500",
  };

  const onConfirm = () => {
    const newStatus =
      selectedKey === "resolved"
        ? ReportStatusEnum.resolved
        : ReportStatusEnum.rejected;

    const updateReportStatusDto: UpdateReportStatusDto = {
      reportId: report.reports[0].id,
      status: newStatus,
    };

    mutateUpdateReportStatus(updateReportStatusDto, {
      onSuccess: (data: { success: boolean; message: string }) => {
        if (data) {
          setReports((prevReports) =>
            prevReports.map((originalReport) =>
              originalReport.targetId === report.targetId
                ? {
                    ...report,
                    reports: report.reports.map((rr) => ({
                      ...rr,
                      status: newStatus,
                    })),
                  }
                : originalReport,
            ),
          );
          toast.success(data.message, {
            position: "bottom-right",
          });
          setIsShowModal(false);
          setSelectedKey(null);
        }
      },
    });
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-start justify-between gap-3 p-4 
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

            <Tooltip content={capitalize(report.reports[0].status)}>
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block 
                  ${statusColors[report.reports[0].status] || "bg-gray-400"}`}
              />
            </Tooltip>
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
        <Chip
          size="sm"
          color="warning"
          className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
        >
          {report.count} {report.count > 1 ? "reports" : "report"}
        </Chip>

        {report.reports[0].status === ReportStatusEnum.pending && (
          <Dropdown
            placement="bottom-end"
            className="text-black dark:text-white"
            shouldBlockScroll={false}
          >
            <DropdownTrigger>
              <Ellipsis
                size={30}
                className="cursor-pointer focus:outline-none"
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Update Report Status Actions"
              variant="flat"
              selectionMode="single"
              onSelectionChange={(selection) => {
                const key = Array.from(selection)[0];
                setSelectedKey(key?.toString() ?? null);
                setIsShowModal(true);
              }}
              disallowEmptySelection={true}
            >
              <DropdownItem
                key="resolved"
                startContent={<CheckIcon />}
                color="success"
              >
                Resolve
              </DropdownItem>

              <DropdownItem
                key="rejected"
                startContent={<XIcon />}
                color="danger"
              >
                Reject
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>

      {isShowModal && (
        <ConfirmModal
          open={isShowModal}
          onOpenChange={setIsShowModal}
          onCancel={() => {
            setIsShowModal(false);
            setSelectedKey(null);
          }}
          isLoading={isPending}
          onConfirm={onConfirm}
          textHeader={
            selectedKey === "resolved"
              ? "Confirm Report Resolved"
              : "Confirm Report Rejected"
          }
          title={
            selectedKey === "resolved"
              ? "Mark as Resolved?"
              : "Reject this report?"
          }
          description={
            selectedKey === "resolved"
              ? "This report will be marked as resolved."
              : "This report will be rejected and closed."
          }
          confirmText={
            selectedKey === "resolved" ? "Mark Resolved" : "Reject Report"
          }
          cancelText="No, go back"
        />
      )}
    </div>
  );
};

export default ReportCardHeader;
