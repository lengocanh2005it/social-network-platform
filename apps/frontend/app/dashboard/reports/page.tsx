"use client";
import { LoadMoreButton } from "@/components/button/LoadMoreButton";
import EmptyReportsDashboardState from "@/components/EmptyReportsDashboardState";
import FilterReportsForm, {
  FilterFormValues,
} from "@/components/form/FilterReportsForm";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import ReportCard from "@/components/ReportCard";
import { useGetReportsDashboard } from "@/hooks";
import { useUserStore } from "@/store";
import { ReportsDashboardType } from "@/utils";
import { Divider } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const DashboardReportsPage: React.FC = () => {
  const { user } = useUserStore();
  const [filter, setFilter] = useState<Partial<FilterFormValues>>({});
  const [hasFetchedOnce, setHasFetchedOnce] = useState<boolean>(false);
  const [reports, setReports] = useState<ReportsDashboardType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const {
    data,
    isLoading: reactQueryIsLoading,
    isFetching: reactQueryIsFetching,
  } = useGetReportsDashboard(user?.id ?? "", filter);
  const isLoading = !hasFetchedOnce && reactQueryIsLoading;
  const isFetching = reactQueryIsFetching;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setReports((prev) => [...prev, ...(data?.data ?? [])]);
      setNextCursor(data?.nextCursor ?? null);
      setHasFetchedOnce(true);
    }
  }, [data, setReports, setNextCursor, setHasFetchedOnce]);

  const loadMore = () => {
    if (!nextCursor) return;
    setFilter({
      ...filter,
      after: nextCursor,
    });
  };

  const onClear = () => {
    setFilter({
      type: undefined,
      from: undefined,
      to: undefined,
    });
  };

  const onSubmit = (values: FilterFormValues) => {
    queryClient.removeQueries({
      queryKey: [`${user?.id ?? ""}/dashboard/reports`],
    });
    setReports([]);
    setNextCursor(null);
    setHasFetchedOnce(false);
    setFilter(values);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:gap-1 gap-0 mb-4"
      >
        <h1
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 
            to-blue-500 bg-clip-text text-transparent"
        >
          Reports Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage and review all reports created by users.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <FilterReportsForm
          defaultValues={filter}
          key={JSON.stringify(filter)}
          onSubmit={onSubmit}
          isLoading={isFetching}
        />
      </motion.div>

      <Divider className="dark:bg-white/20 mt-4 mb-4" />

      {(isFetching && !hasFetchedOnce) || isLoading ? (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <PrimaryLoading />
        </div>
      ) : reports.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-3">
            {reports.map((report) => (
              <motion.div
                key={report.targetId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReportCard report={report} setReports={setReports} />
              </motion.div>
            ))}
          </div>

          {isFetching && nextCursor && (
            <div className="col-span-full flex justify-center">
              <PrimaryLoading />
            </div>
          )}

          {nextCursor && (
            <motion.div
              key="load-more"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="col-span-full flex justify-center"
            >
              <LoadMoreButton onClick={loadMore} isLoading={isFetching} />
            </motion.div>
          )}
        </>
      ) : !isFetching && hasFetchedOnce ? (
        <EmptyReportsDashboardState
          hasActiveFilter={!!(filter.type || filter.from || filter.to)}
          onClearFilter={onClear}
        />
      ) : (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <PrimaryLoading />
        </div>
      )}
    </div>
  );
};

export default DashboardReportsPage;
