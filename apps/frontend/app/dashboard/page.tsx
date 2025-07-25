"use client";
import ActivityItem from "@/components/ActivityItem";
import { StatCard } from "@/components/StatCard";
import StatCardSkeleton from "@/components/StatCardSkeleton";
import { UserPostChart } from "@/components/UserPostChart";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetActivities, useGetStats, useInfiniteScroll } from "@/hooks";
import { getActivities } from "@/lib/api/admin";
import { useUserStore } from "@/store";
import { Activity, statConfig, StatsType } from "@/utils";
import { Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useUserStore();
  const { data: activitiesData, isLoading: isActivitiesDataLoading } =
    useGetActivities(user?.id ?? "", {});
  const { data, isLoading } = useGetStats(user?.id ?? "");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<StatsType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    if (activitiesData) {
      setActivities(activitiesData?.data ?? []);
      setNextCursor(activitiesData?.nextCursor ?? null);
    }
  }, [activitiesData, setActivities, setNextCursor]);

  useEffect(() => {
    if (data) {
      const newStats = statConfig.map(({ key, ...rest }) => {
        const stat = data?.[key];
        return {
          ...rest,
          value: stat?.value ?? "--",
          percent: `${stat?.percent ?? 0}%`,
          trend: stat?.trend ?? "up",
        };
      });
      setStats(newStats);
    }
  }, [data, setStats]);

  const loadMore = async () => {
    if (!nextCursor || hasMore) return;

    setHasMore(true);

    try {
      const res = await getActivities({
        after: nextCursor,
      });

      if (res && res?.data) {
        setActivities((prev) => [...prev, ...res.data]);
        setNextCursor(res?.nextCursor ?? null);
      }
    } finally {
      setHasMore(false);
    }
  };

  const lastActivityRef = useInfiniteScroll(loadMore, !!nextCursor);

  return (
    <div className="p-6 md:p-10 bg-gray-900 text-gray-100 space-y-10 rounded-xl">
      <section className="space-y-4">
        <motion.h2
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 
          to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Overview
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? statConfig.map((_, idx) => <StatCardSkeleton key={idx} />)
            : stats.map((item, idx) => <StatCard key={idx} stats={item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Analytics & Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          <Card className="bg-gray-800 border border-gray-700 overflow-hidden">
            <CardBody className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-200">
                Growth Overview
              </h3>
              <div className="h-80 overflow-hidden">
                <UserPostChart />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gray-800 border border-gray-700">
            <CardBody className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-200">
                Recent Activities
              </h3>

              <ScrollArea className="max-h-[300px]">
                {isActivitiesDataLoading ? (
                  <div className="h-[300px] flex flex-col items-center justify-center">
                    <PrimaryLoading />
                  </div>
                ) : (
                  <>
                    {activities?.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center h-[300px]
                      md:gap-2 gap-1"
                      >
                        <h1>Empty Activities</h1>
                        <p className="text-black/80 dark:text-white/70">
                          No recent activities found. Check back later.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:gap-4 gap-3">
                          {activities.map((activity, index) => (
                            <ActivityItem
                              key={activity.id}
                              activity={activity}
                              ref={lastActivityRef}
                              index={index}
                              length={activities.length}
                            />
                          ))}

                          {hasMore && <PrimaryLoading />}
                        </div>
                      </>
                    )}
                  </>
                )}
              </ScrollArea>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
