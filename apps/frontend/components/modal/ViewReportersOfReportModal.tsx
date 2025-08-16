"use client";
import EmptyReportersDashboardState from "@/components/EmptyReportersDashboardState";
import FilterReportersForm, {
  FilterFormValues,
} from "@/components/form/FilterReportersForm";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import ReporterCard from "@/components/ReporterCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetReportersOfReport } from "@/hooks";
import { useUserStore } from "@/store";
import { ReportsDashboardDetailsType, ReportsDashboardType } from "@/utils";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";

interface ViewReportersOfReportModalProps {
  isOpen: boolean;
  report: ReportsDashboardType;
  setIsOpen: (isOpen: boolean) => void;
}

const ViewReportersOfReportModal: React.FC<ViewReportersOfReportModalProps> = ({
  isOpen,
  report,
  setIsOpen,
}) => {
  const { user } = useUserStore();
  const [filter, setFilter] = useState<Partial<FilterFormValues>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState<
    ReportsDashboardDetailsType[]
  >([]);
  const [hasFetchedOnce, setHasFetchedOnce] = useState<boolean>(false);
  const {
    data,
    isLoading: reactQueryIsLoading,
    isFetching: reactQueryIsFetching,
  } = useGetReportersOfReport(user?.id ?? "", report.targetId, filter);
  const queryClient = useQueryClient();

  const isLoading = !hasFetchedOnce && reactQueryIsLoading;
  const isFetching = reactQueryIsFetching;

  useEffect(() => {
    if (data) {
      setReportDetails((prev) => [...prev, ...(data?.data ?? [])]);
      setNextCursor(data?.nextCursor ?? null);
      setHasFetchedOnce(true);
    }
  }, [data, setReportDetails, setNextCursor, setHasFetchedOnce]);

  const handleFilterChange = useCallback(
    (values: FilterFormValues) => {
      queryClient.removeQueries({
        queryKey: [`${user?.id ?? ""}/dashboard/reports`],
      });
      setReportDetails([]);
      setNextCursor(null);
      setHasFetchedOnce(false);
      setFilter(values);
    },
    [queryClient, user?.id],
  );

  const loadMore = () => {
    if (!nextCursor) return;
    setFilter({
      ...filter,
      after: nextCursor,
    });
  };

  const onClear = () => {
    setFilter({
      reason: undefined,
      after: undefined,
    });
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      placement="center"
      size="xl"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        setReportDetails([]);
        setNextCursor(null);
        setHasFetchedOnce(false);
        queryClient.removeQueries({
          queryKey: [
            `${user?.id ?? ""}/dashboard/reports/${report.targetId}/reporters`,
          ],
        });
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Reporters Details
              <p className="text-sm text-black/70 dark:text-white/70 font-normal">
                View the detailed list of reporters for the report with ID{" "}
                <span className="italic font-bold underline">
                  {report.targetId.slice(0, 6)}
                </span>
              </p>
            </ModalHeader>
            <ModalBody>
              <FilterReportersForm
                defaultValues={filter}
                key={JSON.stringify(filter)}
                onSubmit={handleFilterChange}
                isLoading={isFetching}
              />

              <Divider className="dark:bg-gray-700 mt-1" />

              {(isFetching && !hasFetchedOnce) || isLoading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <PrimaryLoading />
                </div>
              ) : reportDetails.length > 0 ? (
                <ScrollArea
                  className="h-[300px] border-b dark:border-gray-700 border-gray-200
                p-4 pl-2 pt-0"
                >
                  <div className="flex flex-col md:gap-2 gap-1">
                    {reportDetails.map((reportDetail) => (
                      <div key={reportDetail.id} className="relative">
                        <ReporterCard reportDetail={reportDetail} />
                      </div>
                    ))}
                  </div>

                  {isFetching && nextCursor && (
                    <div className="flex justify-center items-center">
                      <PrimaryLoading />
                    </div>
                  )}

                  {nextCursor && (
                    <Button
                      onPress={loadMore}
                      className="w-fit mx-auto mt-2 flex items-center justify-center"
                      size="sm"
                    >
                      Load More
                    </Button>
                  )}
                </ScrollArea>
              ) : !isFetching && hasFetchedOnce ? (
                <ScrollArea className="h-[300px]">
                  <EmptyReportersDashboardState
                    hasActiveFilter={!!filter.reason}
                    onClearFilter={onClear}
                  />
                </ScrollArea>
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <PrimaryLoading />
                </div>
              )}
            </ModalBody>
            <ModalFooter
              className="relative flex items-center w-fit mx-auto 
            justify-center md:gap-2 gap-1"
            >
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewReportersOfReportModal;
