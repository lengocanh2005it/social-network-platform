"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import PostMediaItem from "@/components/post/PostMediaItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeleteBookMarks, useGetBookMarks } from "@/hooks";
import { getBookMarks } from "@/lib/api/bookmarks";
import { useUserStore } from "@/store";
import { BookMark } from "@/utils";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { format } from "date-fns";
import {
  Bookmark,
  BookmarkIcon,
  ClockIcon,
  Ellipsis,
  Eye,
  HeartIcon,
  MessageSquareIcon,
  Share2Icon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BookMarksTab: React.FC = () => {
  const { user, viewedUser } = useUserStore();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentPageData, setCurrentPageData] = useState<BookMark[]>([]);
  const { data, isLoading } = useGetBookMarks(user?.id ?? "", {});
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const { mutate: mutateDeleteBookMarks, isPending } = useDeleteBookMarks();
  const router = useRouter();

  const fetchPage = (cursor?: string, isGoingBack = false) => {
    getBookMarks({ after: cursor }).then((res) => {
      setCurrentPageData(res.data);
      setNextCursor(res.nextCursor ?? null);
      if (!isGoingBack && cursor) {
        setCursorHistory((prev) => [...prev, cursor]);
      }
      if (isGoingBack) {
        setCursorHistory((prev) => prev.slice(0, -1));
      }
    });
  };

  useEffect(() => {
    if (data) {
      setCurrentPageData(data.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setCurrentPageData, setNextCursor]);

  const handleNext = () => {
    if (nextCursor) {
      fetchPage(nextCursor);
    }
  };

  const handlePrev = () => {
    if (cursorHistory.length > 0) {
      const prevCursor = cursorHistory[cursorHistory.length - 2];
      fetchPage(prevCursor, true);
    }
  };

  const handleRemoveBookmark = (postId: string) => {
    mutateDeleteBookMarks(
      {
        postIds: [postId],
      },
      {
        onSuccess: async (data: {
          success: true;
          message: string;
          bookMarkIds: string[];
        }) => {
          if (!data) return;

          toast.success("This post has been removed from your bookmarks.", {
            position: "bottom-right",
          });

          const updated = currentPageData.filter((p) => p.post.id !== postId);

          if (updated.length >= 1) {
            setCurrentPageData(updated);
            return;
          }

          if (nextCursor) {
            try {
              const res = await getBookMarks({ after: nextCursor });
              setCurrentPageData(res.data);
              setNextCursor(res.nextCursor ?? null);
              setCursorHistory((prev) => [...prev, nextCursor]);
            } catch (err) {
              console.error("Failed to load next page:", err);
              setCurrentPageData(updated);
            }
            return;
          }

          if (cursorHistory.length >= 1) {
            const newCursorHistory = cursorHistory.slice(0, -1);
            const backCursor = newCursorHistory.at(-1) ?? null;

            try {
              const res = await getBookMarks(
                backCursor ? { after: backCursor } : {},
              );
              setCurrentPageData(res.data);
              setNextCursor(res.nextCursor ?? null);
              setCursorHistory(newCursorHistory);
            } catch (err) {
              console.error("Failed to go back to previous page:", err);
              setCurrentPageData([]);
            }
            return;
          }

          setCurrentPageData([]);
        },
      },
    );
  };

  const handleViewPostDetails = (bookMark: BookMark) => {
    router.push(
      `/${bookMark.post.user.profile.username}/posts/${bookMark.post.id}`,
    );
  };

  if (viewedUser?.id !== user?.id) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[30vh]">
        <h1 className="text-lg">Forbidden</h1>
        <p className="text-medium text-gray-500">
          You&apos;re not allowed to view another user&apos;s bookmarks.
        </p>
      </div>
    );
  }

  if (isLoading) return <PrimaryLoading />;

  return (
    <div
      className="bg-white rounded-lg w-full shadow dark:shadow-none p-4 flex 
      flex-col md:gap-4 gap-3 relative
    dark:bg-black dark:text-white"
    >
      <div className="flex flex-col text-medium">
        <h1 className="text-medium">Your Bookmarks</h1>
        <p className="text-sm text-gray-500 dark:text-white/60">
          View and manage posts you&apos;ve saved.
        </p>
      </div>

      <Divider className="bg-gray-200 dark:bg-white/20" />

      <>
        {currentPageData.length === 0 && !isLoading ? (
          <>
            <div
              className="text-center text-gray-500 mt-4 flex flex-col items-center justify-center
            h-[20vh]"
            >
              <Bookmark
                className="mx-auto w-10 h-10 text-gray-400 mb-2
              dark:text-white/70"
              />
              <p> You don&apos;t have any bookmarks yet.</p>
            </div>
          </>
        ) : (
          <>
            <ScrollArea className="max-h-[450px]">
              <div className="grid grid-cols-1 md:gap-3 gap-2 pb-2">
                {currentPageData.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="duration-250 ease-in-out transition-all
              p-4 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-gray-200
              dark:hover:bg-white/10 dark:border-white/20 dark:border"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          src={bookmark.post.user.profile.avatar_url}
                          alt={`${bookmark.post.user.profile.first_name} ${bookmark.post.user.profile.last_name}`}
                          className="w-10 h-10 flex-shrink-0 cursor-pointer select-none"
                        />
                        <div>
                          <p className="text-medium font-medium text-gray-700 dark:text-white/80">
                            {bookmark.post.user.profile.first_name}{" "}
                            {bookmark.post.user.profile.last_name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 dark:text-white/70">
                            <ClockIcon className="w-3 h-3" />
                            {format(
                              new Date(bookmark.post.created_at),
                              "dd/MM/yyyy",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => handleRemoveBookmark(bookmark.post.id)}
                          className={`text-yellow-500 ${isPending && "opacity-40 select-none pointer-events-none"}`}
                        >
                          <BookmarkIcon className="fill-current" size={23} />
                        </span>

                        <Dropdown
                          placement="bottom-end"
                          className="text-black dark:text-white"
                          shouldBlockScroll={false}
                        >
                          <DropdownTrigger>
                            <Button isIconOnly className="bg-transparent">
                              <Ellipsis
                                className="text-gray-700 focus:outline-none
                              dark:text-white/80"
                              />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="" variant="flat">
                            <DropdownItem
                              key="view"
                              startContent={<Eye />}
                              onClick={() => handleViewPostDetails(bookmark)}
                            >
                              View Post
                            </DropdownItem>
                            <DropdownItem
                              key="remove"
                              startContent={<TrashIcon />}
                              onClick={() =>
                                handleRemoveBookmark(bookmark.post.id)
                              }
                            >
                              Remove Bookmark
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>

                    <div className="mb-3">
                      {bookmark?.post?.contents?.length !== 0 && (
                        <>
                          <div className="flex flex-col">
                            {bookmark.post.contents.map((c) => (
                              <p
                                key={c.id}
                                className="text-sm text-gray-800 max-w-full truncate
                                dark:text-white/80"
                              >
                                {c.content}
                              </p>
                            ))}
                          </div>
                        </>
                      )}

                      {bookmark?.post?.hashtags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {bookmark.post.hashtags.map((tag) => (
                            <span
                              key={tag.id}
                              className="text-xs text-blue-500"
                            >
                              #{tag.hashtag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {bookmark?.post?.images?.length > 0 && (
                      <PostMediaItem
                        post={bookmark.post}
                        images={bookmark.post.images}
                      />
                    )}

                    <div
                      className="flex items-center justify-between text-sm mt-6 text-gray-500
                    dark:text-white/80"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <HeartIcon size={15} />
                          {bookmark.post.total_likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquareIcon size={15} />
                          {bookmark.post.total_comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2Icon size={15} />
                          {bookmark.post.total_shares}
                        </span>
                      </div>

                      <p
                        className="text-xs text-gray-500 flex items-center gap-1
                      dark:text-white/80"
                      >
                        Saved at:{" "}
                        {format(
                          new Date(bookmark.saved_at),
                          "dd/MM/yyyy HH:mm:ss",
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end mt-4 items-center md:gap-2 gap-1">
              <Button
                isDisabled={cursorHistory.length === 0}
                onPress={handlePrev}
                size="sm"
                color="primary"
              >
                ← Prev
              </Button>

              <Button
                isDisabled={!nextCursor}
                onPress={handleNext}
                size="sm"
                color="primary"
              >
                Next →
              </Button>
            </div>
          </>
        )}
      </>
    </div>
  );
};

export default BookMarksTab;
