"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import { useCreateFriendRequest, useFriendList } from "@/hooks";
import { getFriendsList } from "@/lib/api/users";
import { useUserStore } from "@/store";
import {
  CreateFriendRequestType,
  FriendListType,
  FriendSuggestionType,
  RelationshipType,
} from "@/utils";
import { Button, Tooltip } from "@heroui/react";
import { UserPlus, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const PeopleKnow: React.FC = () => {
  const { user, setRelationship } = useUserStore();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { data, isLoading } = useFriendList(FriendListType.SUGGESTIONS, true);
  const [friendSuggestions, setFriendSuggestions] = useState<
    FriendSuggestionType[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { mutate: mutateCreateFriendRequest } = useCreateFriendRequest();

  const handleLoadMore = async () => {
    if (!nextCursor || loadMore) return;

    setLoadMore(true);

    try {
      const res = await getFriendsList({
        username: user?.profile?.username ?? "",
        type: FriendListType.SUGGESTIONS,
        after: nextCursor,
      });

      if (res?.data) setFriendSuggestions((prev) => [...prev, ...res.data]);

      setNextCursor(res?.nextCursor ? res.nextCursor : null);
    } finally {
      setLoadMore(false);
    }
  };

  useEffect(() => {
    if (data) {
      setFriendSuggestions(data.data);
      setNextCursor(data?.nextCursor ?? null);
    }
  }, [data, setFriendSuggestions, setNextCursor]);

  const handleAddNewFriendClick = (friend: FriendSuggestionType) => {
    if (!friend?.user_id) return;

    const createFriendRequestDto: CreateFriendRequestType = {
      target_id: friend.user_id,
    };

    setLoadingId(friend.user_id);

    mutateCreateFriendRequest(createFriendRequestDto, {
      onSuccess: (data: RelationshipType) => {
        if (data) {
          toast.success("Friend request has been sent to this user.", {
            position: "bottom-right",
          });
          setRelationship(data);
          setFriendSuggestions((prev) =>
            prev.filter((p) => p.user_id !== friend.user_id),
          );
        }
      },
      onSettled: () => {
        setLoadingId(null);
      },
    });
  };

  return (
    <section
      className="p-4 border border-black/10 dark:border-white/30 rounded-lg 
    flex flex-col md:gap-2 gap-1"
    >
      {friendSuggestions?.length !== 0 && (
        <div className="flex items-center justify-between">
          <h1 className="text-medium">People You May Know</h1>
          <Link
            href={"/friends/?tab=suggestions"}
            className="text-blue-600 hover:underline"
          >
            See all
          </Link>
        </div>
      )}

      {isLoading ? (
        <PrimaryLoading />
      ) : (
        <>
          {friendSuggestions?.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-white/80 mt-4 flex flex-col items-center gap-2">
              <Users className="w-12 h-12 text-gray-400" />
              <p className="text-lg font-semibold">No suggestions available</p>
              <p className="text-sm">
                You&apos;ll see friend suggestions here once you start
                connecting with more people.
              </p>
            </div>
          ) : (
            <div className="w-full py-2 relative px-3">
              <Swiper
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                spaceBetween={10}
                slidesPerView={6}
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
                {friendSuggestions.map((p) => (
                  <SwiperSlide
                    key={p.user_id}
                    className="h-full select-none cursor-pointer md:gap-3 gap-2"
                  >
                    <div
                      className="flex flex-col md:gap-3 gap-2 text-center border border-black/20
              rounded-lg dark:border-white/40"
                    >
                      <div className="h-40 relative rounded-t-lg overflow-hidden">
                        <Image
                          src={p.avatar_url}
                          alt={p.full_name}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                          fill
                          className="object-cover"
                        />

                        <div
                          className="p-2 absolute right-2 top-2 rounded-full bg-gray-200 
                          hover:bg-gray-300 ease-in-out transition-all duration-250 
                          dark:bg-black/80 dark:hover:bg-black dark:text-white"
                          onClick={() =>
                            setFriendSuggestions((prev) =>
                              prev.filter((pre) => pre.user_id !== p.user_id),
                            )
                          }
                        >
                          <X size={20} />
                        </div>
                      </div>

                      <div className="grid grid-rows-3 p-2 rounded-md">
                        <div className="flex flex-col relative mb-1">
                          <Tooltip content={p.full_name} delay={5000}>
                            <p className="row-span-1 truncate max-w-full dark:text-white">
                              {p.full_name}
                            </p>
                          </Tooltip>

                          <p className="text-xs text-gray-500 dark:text-white/80">
                            @{p.username}
                          </p>
                        </div>

                        <div className="row-span-1">
                          {p.mutual_friends > 0 && (
                            <p>{p.mutual_friends} mututal friends</p>
                          )}
                        </div>

                        {loadingId === p.user_id ? (
                          <Button
                            className="row-span-1 bg-blue-500 text-white"
                            isLoading
                          >
                            Please wait...
                          </Button>
                        ) : (
                          <Button
                            className="row-span-1 bg-blue-500 text-white"
                            startContent={<UserPlus />}
                            onPress={() => handleAddNewFriendClick(p)}
                          >
                            Add friend
                          </Button>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div
                className={`swiper-button-prev !left-0 !text-black dark:!text-white after:!text-2xl ${
                  isBeginning ? "!hidden" : ""
                }`}
              ></div>

              <div
                className={`swiper-button-next !right-0 !text-black dark:!text-white after:!text-2xl ${
                  isEnd ? "!hidden" : ""
                }`}
              ></div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PeopleKnow;
