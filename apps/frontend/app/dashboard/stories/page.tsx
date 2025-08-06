"use client";
import { LoadMoreButton } from "@/components/button/LoadMoreButton";
import EmptyStoriesDashboardState from "@/components/EmptyStoriesDashboardState";
import FilterStoriesForm, {
  FilterFormValues,
} from "@/components/form/FilterStoriesForm";
import LoadingComponent from "@/components/loading/LoadingComponent";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import StoryCard from "@/components/StoryCard";
import { useDebounce, useGetStoriesDashboard } from "@/hooks";
import { getStoriesDashboard } from "@/lib/api/admin";
import { useUserStore } from "@/store";
import { handleAxiosError, isValidEmail, Story } from "@/utils";
import { DateValue, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";

const StoriesDashboardPage: React.FC = () => {
  const { user } = useUserStore();
  const [filter, setFilter] = useState<Partial<FilterFormValues>>({});
  const [search, setSearch] = useState<string>("");
  const [stories, setStories] = useState<Story[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isClearTrigger, setIsClearTrigger] = useState<boolean>(false);

  const debouncedSearch = useDebounce(search, 500);

  const query = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    const base: Record<string, string | number | DateValue> = { ...filter };

    delete base.search;

    if (trimmed) {
      if (isValidEmail(trimmed)) {
        base.email = trimmed;
        delete base.username;
      } else {
        base.username = trimmed;
        delete base.email;
      }
    } else {
      delete base.email;
      delete base.username;
    }

    return base;
  }, [debouncedSearch, filter]);

  const {
    data,
    isLoading: reactQueryIsLoading,
    isFetching: reactQueryIsFetching,
  } = useGetStoriesDashboard(user?.id ?? "", query);

  const isLoading = !hasFetchedOnce && reactQueryIsLoading;
  const isFetching = reactQueryIsFetching;
  const isDebouncing = search !== debouncedSearch;

  useEffect(() => {
    if (data) {
      setStories(data?.data ?? []);
      setNextCursor(data?.nextCursor ?? null);
      setHasFetchedOnce(true);
    }
  }, [data]);

  const onClear = () => {
    setFilter({
      search: "",
      status: undefined,
      from: undefined,
      to: undefined,
      email: undefined,
      username: undefined,
    });

    setIsClearTrigger(true);

    setTimeout(() => {
      setIsClearTrigger(false);
    }, 300);
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setHasMore(true);

    try {
      const response = await getStoriesDashboard({
        ...query,
        after: nextCursor,
      });

      setStories((prev) => [...prev, ...response?.data]);
      setNextCursor(response?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
  };

  const handleFilterChange = (values: FilterFormValues) => {
    setFilter(values);
    setSearch(values.search ?? "");
  };

  if (isLoading) return <LoadingComponent />;

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
          Story Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage and review all stories created by users.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <FilterStoriesForm
          onChange={handleFilterChange}
          isLoading={isLoading}
          isClearTrigger={isClearTrigger}
        />
      </motion.div>

      <Divider className="dark:bg-white/20 mt-4 mb-4" />

      {(isFetching && !hasFetchedOnce) || isLoading ? (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <PrimaryLoading />
        </div>
      ) : stories.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-3">
            {stories.map((story, index) => (
              <motion.div
                key={story.id || `story-${index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <StoryCard story={story} setStories={setStories} />
              </motion.div>
            ))}
          </div>

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
        </>
      ) : !isFetching && hasFetchedOnce && !isDebouncing ? (
        <EmptyStoriesDashboardState
          hasActiveFilter={
            !!(
              filter.search ||
              filter.status ||
              filter.from ||
              filter.to ||
              filter.email ||
              filter.username
            )
          }
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

export default StoriesDashboardPage;
