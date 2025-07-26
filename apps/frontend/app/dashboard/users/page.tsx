"use client";
import { LoadMoreButton } from "@/components/button/LoadMoreButton";
import { EmptyState } from "@/components/EmptyState";
import { UserFilterForm } from "@/components/form/UserFilterForm";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { UserCard } from "@/components/UserCard";
import { UserCardSkeleton } from "@/components/UserCardSkeleton";
import { useGetUsersDashboard } from "@/hooks";
import { getUsersDashboard } from "@/lib/api/admin";
import { useUserStore } from "@/store";
import { FilterUserType, handleAxiosError, UserDashboardType } from "@/utils";
import { Divider } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DashboardUsersPage = () => {
  const { user } = useUserStore();
  const [filters, setFilters] = useState<FilterUserType>({
    exactMatch: false,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [users, setUsers] = useState<UserDashboardType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { data, isLoading, isFetching } = useGetUsersDashboard(
    user?.id ?? "",
    {},
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setUsers(data?.data ?? []);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setUsers, setNextCursor]);

  useEffect(() => {
    if (!isLoading && !isFetching && data) {
      setHasFetchedOnce(true);
    }
  }, [isLoading, isFetching, data]);

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== false,
  );

  const handleSearchUsers = async (filtered: Partial<FilterUserType>) => {
    try {
      setIsSearching(true);

      const response = await getUsersDashboard(filtered);

      if (response) {
        setUsers(response?.data ?? []);
        setNextCursor(response?.nextCursor ?? null);
      }
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSearch = async () => {
    const filtered = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => Boolean(value)),
    ) as Partial<FilterUserType>;

    await handleSearchUsers(filtered);
  };

  const loadMore = async () => {
    if (!nextCursor) return;

    setHasMore(true);

    try {
      const filtered = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => Boolean(value)),
      ) as Partial<FilterUserType>;

      const response = await getUsersDashboard({
        ...filtered,
        after: nextCursor,
      });

      setUsers((prev) => [...prev, ...(response?.data ?? [])]);
      setNextCursor(response?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
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
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
        bg-clip-text text-transparent"
        >
          User Management
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage and monitor all registered users in your system.
        </p>
      </motion.div>

      <UserFilterForm
        filters={filters}
        setFilters={setFilters}
        showAdvanced={showAdvancedFilters}
        toggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
        hasActiveFilters={hasActiveFilters}
        onReset={() => {
          setFilters({
            fullName: "",
            username: "",
            email: "",
            phoneNumber: "",
            exactMatch: false,
          });

          handleSearchUsers({});
        }}
        onSearch={onSearch}
      />

      <Divider className="dark:bg-white/20 mt-3" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {isLoading || isFetching || isSearching ? (
          Array.from({ length: 6 }).map((_, i) => <UserCardSkeleton key={i} />)
        ) : users.length > 0 ? (
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UserCard user={user} />
              </motion.div>
            ))}

            {hasMore && (
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
          </AnimatePresence>
        ) : hasFetchedOnce ? (
          <EmptyState hasActiveFilters={hasActiveFilters} />
        ) : null}
      </div>
    </div>
  );
};

export default DashboardUsersPage;
