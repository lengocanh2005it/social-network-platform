"use client";
import ActivityItem from "@/components/ActivityItem";
import EmptyActivitiesState from "@/components/EmptyActivitiesState";
import { StatCard } from "@/components/StatCard";
import StatCardSkeleton from "@/components/StatCardSkeleton";
import { UserPostChart } from "@/components/UserPostChart";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDebounce,
  useGetActivities,
  useGetStats,
  useInfiniteScroll,
} from "@/hooks";
import { getActivities } from "@/lib/api/admin";
import { useUserStore } from "@/store";
import { Activity, statConfig, StatsType } from "@/utils";
import { Card, CardBody, Input } from "@heroui/react";
import { motion } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<StatsType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const { data: activitiesData, isLoading: isActivitiesDataLoading } =
    useGetActivities(user?.id ?? "", {
      fullName: debouncedSearchTerm.trim() || undefined,
    });
  const { data: statsData, isLoading: isStatsLoading } = useGetStats(
    user?.id ?? "",
  );

  useEffect(() => {
    if (statsData) {
      const newStats = statConfig.map(({ key, ...rest }) => {
        const stat = statsData?.[key];
        return {
          ...rest,
          value: stat?.value ?? "--",
          percent: `${stat?.percent ?? 0}%`,
          trend: stat?.trend ?? "up",
        };
      });
      setStats(newStats);
    }
  }, [statsData]);

  useEffect(() => {
    if (activitiesData) {
      setActivities(activitiesData?.data ?? []);
      setNextCursor(activitiesData?.nextCursor ?? null);
    }
  }, [activitiesData, setActivities, setNextCursor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getActivities({
        after: nextCursor,
        fullName: debouncedSearchTerm.trim() || undefined,
      });
      if (res?.data) {
        setActivities((prev) => [...prev, ...res.data]);
        setNextCursor(res?.nextCursor ?? null);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
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
          {isStatsLoading
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
            <CardBody className="p-6 flex flex-col md:gap-4 gap-3">
              <div className="relative flex md:flex-row flex-col justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-200">
                  Recent Activities
                </h3>

                <Input
                  className="md:w-[60%] w-full"
                  size="md"
                  isClearable
                  value={searchTerm}
                  onChange={handleInputChange}
                  startContent={<SearchIcon />}
                  placeholder="Enter user's full name..."
                  onClear={handleClear}
                />
              </div>

              <ScrollArea className="max-h-[300px]">
                {isActivitiesDataLoading ||
                (activities.length === 0 && searchTerm.trim() === "") ? (
                  <div className="h-[300px] flex flex-col items-center justify-center">
                    <PrimaryLoading />
                  </div>
                ) : activities.length === 0 ? (
                  <EmptyActivitiesState searchTerm={searchTerm} />
                ) : (
                  <div className="flex flex-col md:gap-4 gap-3 border-t dark:border-t-white/10 pt-4">
                    {activities.map((activity, index) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        ref={lastActivityRef}
                        index={index}
                        length={activities.length}
                      />
                    ))}
                    {isLoadingMore && <PrimaryLoading />}
                  </div>
                )}
              </ScrollArea>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
