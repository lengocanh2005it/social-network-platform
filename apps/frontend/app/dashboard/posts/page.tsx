"use client";
import { LoadMoreButton } from "@/components/button/LoadMoreButton";
import EmptyPostsDashboardState from "@/components/EmptyPostsDashboardState";
import LoadingComponent from "@/components/loading/LoadingComponent";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import PostCard from "@/components/PostCard";
import { useGetPostsDashboard } from "@/hooks";
import { getPostsDashboard } from "@/lib/api/admin";
import { PostDetails, useUserStore } from "@/store";
import { handleAxiosError, isValidEmail } from "@/utils";
import { Divider, Input } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const DashboardPostsPage: React.FC = () => {
  const { user } = useUserStore();
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<PostDetails[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isManuallyClearing, setIsManuallyClearing] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const query = search?.trim() && isValidEmail(search) ? { email: search } : {};
  const { data, isLoading, isFetching } = useGetPostsDashboard(
    user?.id ?? "",
    query,
  );

  const fetchPosts = useCallback(
    async (email: string) => {
      try {
        setIsSearching(true);
        const query = email.trim() && isValidEmail(email) ? { email } : {};
        const response = await getPostsDashboard(query);
        setPosts(response?.data ?? []);
        setNextCursor(response?.nextCursor ?? null);
      } catch (error) {
        handleAxiosError(error);
      } finally {
        setIsSearching(false);
      }
    },
    [setIsSearching, setPosts, setNextCursor],
  );

  const debouncedSearch = useMemo(() => {
    return debounce((email: string) => {
      if (isValidEmail(email) || !email?.trim()) {
        fetchPosts(email);
      }
    }, 500);
  }, [fetchPosts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const onClear = () => {
    setIsManuallyClearing(true);
    setSearch("");
    fetchPosts("");
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!isSearching && !isFetching && isManuallyClearing) {
      setIsManuallyClearing(false);
    }
  }, [isSearching, isFetching, isManuallyClearing]);

  useEffect(() => {
    if (!isLoading && !isFetching && data) {
      setHasFetchedOnce(true);
    }
  }, [isLoading, isFetching, data]);

  useEffect(() => {
    if (data) {
      setPosts(data?.data ?? []);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setPosts, setNextCursor]);

  const loadMore = async () => {
    if (!nextCursor) return;

    setHasMore(true);

    try {
      const response = await getPostsDashboard({
        ...query,
        after: nextCursor,
      });

      setPosts((prev) => [...prev, ...response?.data]);
      setNextCursor(response?.nextCursor ?? null);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setHasMore(false);
    }
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
          Post Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage and review all posts submitted by users.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Input
          placeholder="Search by author's email"
          value={search}
          onChange={handleChange}
          onClear={onClear}
        />
      </motion.div>

      <Divider className="dark:bg-white/20 mt-4 mb-4" />

      {isLoading || isFetching || isSearching ? (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <PrimaryLoading />
        </div>
      ) : posts.length > 0 ? (
        <AnimatePresence>
          <div className="flex flex-col md:gap-4 gap-3">
            {posts.map((post, index) => (
              <motion.div
                key={post.id || `post-${index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PostCard post={post} setPosts={setPosts} />
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
        </AnimatePresence>
      ) : hasFetchedOnce &&
        !isSearching &&
        !isFetching &&
        !isManuallyClearing ? (
        <EmptyPostsDashboardState
          hasActiveFilter={search?.trim() !== ""}
          onClearFilter={onClear}
        />
      ) : null}
    </div>
  );
};

export default DashboardPostsPage;
