"use client";
import { Button, Tooltip } from "@heroui/react";
import { UserPlus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const people = [
  {
    key: 1,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 1,
  },
  {
    key: 2,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: null,
  },
  {
    key: 3,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 3,
  },
  {
    key: 4,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 4,
  },
  {
    key: 5,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: null,
  },
  {
    key: 6,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 4,
  },
  {
    key: 7,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 4,
  },
  {
    key: 8,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 4,
  },
  {
    key: 9,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: null,
  },
  {
    key: 10,
    avt: "https://qwilddaqnrznqbhuskzx.supabase.co/storage/v1/object/public/files//1743911620903-profile-2.png",
    name: "John Doe",
    mututal_friends: 4,
  },
];

const PeopleKnow = () => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="py-2 px-4 border border-black/10 rounded-lg">
      <div className="flex items-center justify-between">
        <p>People You May Know</p>
        <Link href={"/"} className="text-blue-600 hover:underline">
          See all
        </Link>
      </div>

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
          }}
          modules={[Navigation]}
        >
          {people.map((p) => (
            <SwiperSlide
              key={p.key}
              className="h-full select-none cursor-pointer md:gap-3 gap-2"
            >
              <div
                className="flex flex-col md:gap-3 gap-2 text-center border border-black/20
              rounded-lg"
              >
                <div className="h-40 relative rounded-t-lg overflow-hidden">
                  <Image
                    src={p.avt}
                    alt={p.name}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    fill
                    className="object-cover"
                  />

                  <div
                    className="p-2 absolute right-2 top-2 rounded-full bg-gray-200 hover:bg-gray-300
                  ease-in-out transition-all duration-250"
                  >
                    <X size={20} />
                  </div>
                </div>

                <div className="grid grid-rows-3 p-2 rounded-md">
                  <Tooltip content={p.name} delay={5000}>
                    <p className="row-span-1 truncate max-w-full">{p.name}</p>
                  </Tooltip>

                  <div className="row-span-1">
                    {p.mututal_friends && (
                      <p>{p.mututal_friends} mutual friends</p>
                    )}
                  </div>

                  <Button
                    className="row-span-1 bg-blue-200 text-blue-600"
                    startContent={<UserPlus />}
                  >
                    Add friend
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          className={`swiper-button-prev !left-0 !text-black after:!text-2xl ${
            isBeginning ? "!hidden" : ""
          }`}
        ></div>

        <div
          className={`swiper-button-next !right-0 !text-black after:!text-2xl ${
            isEnd ? "!hidden" : ""
          }`}
        ></div>
      </div>
    </section>
  );
};

export default PeopleKnow;
