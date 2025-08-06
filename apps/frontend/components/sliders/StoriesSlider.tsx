"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import CreateStoryModal from "@/components/modal/CreateStoryModal";
import StoryModal from "@/components/modal/StoryModal";
import { useGetStories } from "@/hooks";
import { getStories } from "@/lib/api/stories";
import { useStoryStore, useUserStore } from "@/store";
import { Story } from "@/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function StorySlider() {
  const [isBeginning, setIsBeginning] = useState<boolean>(true);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data, isLoading } = useGetStories(user?.id ?? "");
  const { setStories, stories, addOldStories } = useStoryStore();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    if (data) {
      if (data?.data) setStories(data.data);
      setNextCursor(data?.nextCursor ? data.nextCursor : null);
    }
  }, [data, setNextCursor, setStories]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadMore) return;

    setLoadMore(true);

    try {
      const res = await getStories({
        after: nextCursor,
      });

      if (res?.data) addOldStories(res.data);

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } finally {
      setLoadMore(false);
    }
  };

  return (
    <>
      {user && (
        <>
          {isLoading ? (
            <PrimaryLoading />
          ) : (
            <>
              {stories?.length > 0 ? (
                <div className="w-full py-2 relative flex items-center md:gap-2 gap-1">
                  <div
                    className="relative flex flex-col bg-white items-center justify-end 
              h-48 p-3 text-center rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gray-100 overflow-hidden select-none">
                      <Image
                        src={user.profile.avatar_url}
                        alt={
                          user.profile.first_name + " " + user.profile.last_name
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        className="object-cover filter blur-sm opacity-90 select-none"
                      />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative mb-2 select-none">
                        <Image
                          src={user.profile.avatar_url}
                          alt={
                            user.profile.first_name +
                            " " +
                            user.profile.last_name
                          }
                          width={60}
                          height={60}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                          className="rounded-full border-4 border-white select-none cursor-pointer"
                        />
                        <div
                          className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full
                     text-white w-6 h-6 flex items-center justify-center text-sm border-2
                      border-white cursor-pointer"
                          onClick={() => setIsOpen(true)}
                        >
                          +
                        </div>
                      </div>

                      <div
                        className="bg-white px-2 py-1 rounded-md shadow-sm 
                    whitespace-nowrap cursor-pointer"
                        onClick={() => setIsOpen(true)}
                      >
                        <p className="text-gray-800 text-xs font-medium">
                          Create Story
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-[80%] relative">
                    <Swiper
                      spaceBetween={10}
                      slidesPerView={4.5}
                      navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                      }}
                      onReachBeginning={() => setIsBeginning(true)}
                      onReachEnd={() => setIsEnd(true)}
                      onFromEdge={() => {
                        setIsBeginning(false);
                        setIsEnd(false);
                      }}
                      onSlideChange={(swiper) => {
                        setIsBeginning(swiper.isBeginning);
                        setIsEnd(swiper.isEnd);

                        if (swiper.isEnd && nextCursor) handleLoadMore();
                      }}
                      modules={[Navigation]}
                    >
                      {stories.map((story, index) => (
                        <SwiperSlide
                          key={index}
                          className="h-full select-none cursor-pointer"
                        >
                          <div
                            className="w-full h-48 relative rounded-lg overflow-hidden"
                            onClick={() => setSelectedStory(story)}
                          >
                            {story.content_type === "image" &&
                            story.content_url ? (
                              <Image
                                src={story.content_url}
                                alt="story image"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div
                                className="absolute inset-0 bg-gradient-to-br from-blue-400 
                              to-purple-500 flex items-center justify-center p-4"
                              >
                                <p className="text-white text-base font-semibold text-center">
                                  {story.text_content}
                                </p>
                              </div>
                            )}

                            <div
                              className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t 
                            from-black/60 to-transparent"
                            >
                              <p className="text-white text-sm font-medium">
                                {story.user.full_name}
                              </p>
                            </div>

                            <div
                              className={`absolute top-2 left-2 border-3 
                        ${!story.viewed_by_current_user && "border-blue-500"} rounded-full`}
                            >
                              <Image
                                height={35}
                                width={35}
                                src={story.user.avatar_url}
                                alt={story.user.full_name}
                                className="rounded-full"
                              />
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  <div
                    className={`swiper-button-prev !left-0 !text-black after:!text-2xl ${
                      isBeginning ? "!hidden" : ""
                    }`}
                  ></div>

                  <div
                    className={`swiper-button-next !right-0 !text-black dark:!text-white 
                      after:!text-2xl ${isEnd ? "!hidden" : ""}`}
                  ></div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center 
                h-30 bg-gray-100 rounded-2xl border border-black/10
                dark:bg-black dark:text-white dark:border dark:border-white/30"
                >
                  <p className="text-gray-500 dark:text-white/70 text-sm mb-2">
                    No stories yet
                  </p>

                  <button
                    onClick={() => setIsOpen(true)}
                    className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
                  >
                    + Create your first story
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <CreateStoryModal isOpen={isOpen} setIsOpen={setIsOpen} />

      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
}
