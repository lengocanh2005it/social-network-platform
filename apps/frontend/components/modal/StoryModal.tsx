"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDeleteStory,
  useGetViewersOfStory,
  useInfiniteScroll,
} from "@/hooks";
import { getViewersOfStory } from "@/lib/api/stories";
import { useStoryStore, useUserStore } from "@/store";
import { formatDateTime, handleAxiosError, Story, StoryViewer } from "@/utils";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  EyeIcon,
  EyeOff,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface StoryModalProps {
  story: Story;
  onClose: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ story, onClose }) => {
  const { user } = useUserStore();
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data, isLoading } = useGetViewersOfStory(user?.id ?? "", story.id);
  const [storyViewers, setStoryViewers] = useState<StoryViewer[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { updateStory, removeStory } = useStoryStore();
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const router = useRouter();
  const { mutate: mutateDeleteStory, isPending } = useDeleteStory();
  const [open, setOpen] = useState<boolean>(false);

  const handleConfirmDelete = async () => {
    mutateDeleteStory(story.id, {
      onSuccess: (data: Record<string, string | boolean>) => {
        if (data && typeof data?.message === "string" && data?.success) {
          toast.success(data.message, {
            position: "bottom-right",
          });
          removeStory(story.id);
          onClose();
        }
      },
    });
  };

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadMore) return;

    setLoadMore(true);

    try {
      const res = await getViewersOfStory(story.id, {
        after: nextCursor,
      });

      if (res?.data) setStoryViewers((prev) => [...prev, ...res.data]);

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setLoadMore(false);
    }
  };

  const handleDeleteStory = () => {
    setOpen(true);
    setIsPaused(true);
  };

  useEffect(() => {
    if (data) {
      if (data?.data) setStoryViewers(data.data);
      setNextCursor(data?.nextCursor ? data.nextCursor : null);
      if (data?.story) updateStory(story.id, data.story);
    }
  }, [data, setNextCursor, setStoryViewers, updateStory, story]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    if (progress >= 100) {
      onClose();
    }
  }, [progress, onClose]);

  const lastPostRef = useInfiniteScroll(handleLoadMore, !!nextCursor);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-50 w-[95%] max-w-8xl bg-white rounded-lg overflow-hidden 
      shadow-xl flex dark:bg-black dark:text-white dark:border dark:border-white/10"
      >
        <Button
          startContent={<XIcon />}
          className="absolute top-2 bg-transparent right-2 text-black dark:text-white text-2xl z-50"
          onPress={onClose}
          isIconOnly
        />

        <div className="w-2/3 bg-black relative h-[90vh]">
          {story.content_type === "image" && story.content_url ? (
            <Image
              src={story.content_url}
              alt="Story Image"
              fill
              className="object-contain select-none"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br 
            from-blue-400 to-purple-500"
            >
              <p className="text-white text-2xl font-bold text-center px-6">
                {story.text_content}
              </p>
            </div>
          )}

          <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className="absolute top-4 left-4 right-4 text-white px-3 py-1 rounded-full 
          flex flex-1 justify-between items-center"
          >
            <div
              className="flex items-center rounded-lg justify-between p-2 bg-black/70 
            shadow-md backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={story.user.avatar_url}
                  alt="Avatar"
                  width={35}
                  height={35}
                  className="rounded-full select-none cursor-pointer"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">
                    {story.user.full_name}
                  </span>
                  <span className="text-xs text-white/80 font-normal">
                    {formatDistanceToNowStrict(new Date(story.expires_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 select-none">
              {story.user.id === user?.id && (
                <TrashIcon
                  onClick={handleDeleteStory}
                  className="focus:outline-none cursor-pointer opacity-80 hover:opacity-100 
                  duration-250 ease-in-out transition-all"
                />
              )}
              {isPaused ? (
                <PlayIcon
                  className="cursor-pointer hover:text-white/90 transition"
                  onClick={() => setIsPaused(false)}
                />
              ) : (
                <PauseIcon
                  className="cursor-pointer hover:text-white/90 transition"
                  onClick={() => setIsPaused(true)}
                />
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="w-1/3 h-[90vh] p-6">
          {isLoading ? (
            <>
              <PrimaryLoading />
            </>
          ) : (
            <>
              {storyViewers?.length > 0 ? (
                <div className="flex flex-col md:gap-3 gap-2 overflow-hidden">
                  <div
                    className="flex items-center md:gap-2 gap-1 pb-2 border-b border-black/20
                  dark:border-white/20"
                  >
                    <Tooltip content="Total viewers" showArrow>
                      <EyeIcon
                        className="cursor-pointer focus:outline-none
                      opacity-70 hover:opacity-100 duration-250 ease-in-out transition-opacity"
                      />
                    </Tooltip>

                    <span className="text-lg">
                      {data?.story?.total_views ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-col md:gap-2 gap-1 px-4">
                    {storyViewers.map((viewer, index) => (
                      <div
                        key={viewer.user_id}
                        ref={
                          index === storyViewers.length - 1 ? lastPostRef : null
                        }
                        className="flex items-center justify-between p-2
                        hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={viewer.avatar_url}
                            alt={viewer.full_name}
                            width={40}
                            height={40}
                            className="rounded-full cursor-pointer select-none"
                            onClick={() => handleViewProfile(viewer.username)}
                          />

                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {viewer?.user_id === user?.id
                                ? "You"
                                : viewer.full_name}
                            </span>

                            <span className="text-xs text-gray-500 dark:text-white/80">
                              @{viewer.username}
                            </span>
                          </div>
                        </div>

                        <span className="text-sm font-medium">
                          {formatDateTime(viewer.viewed_at)}
                        </span>
                      </div>
                    ))}

                    {loadMore && (
                      <div
                        className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
            flex-col items-center justify-center text-center"
                      >
                        <Spinner />

                        <p>Loading...</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="text-center p-6 h-full text-gray-500 flex 
                  flex-col items-center justify-center dark:text-white/80"
                  >
                    <EyeOff className="w-10 h-10 mb-2" />

                    <h1 className="text-lg font-semibold">
                      No one has viewed this story yet
                    </h1>

                    <p className="text-sm">
                      Share your story to get your first viewer!
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </ScrollArea>
      </div>

      {open && (
        <ConfirmModal
          open={open}
          onOpenChange={setOpen}
          onCancel={() => {
            setOpen(false);
            setIsPaused(false);
          }}
          isLoading={isPending}
          onConfirm={handleConfirmDelete}
          textHeader="Confirm Story Delete"
          title="Are you sure you want to delete this story?"
          description="This story will be permanently removed."
          confirmText="Delete Story"
          cancelText="No, go back"
        />
      )}
    </div>
  );
};

export default StoryModal;
