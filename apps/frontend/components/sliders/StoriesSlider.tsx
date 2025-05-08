"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState } from "react";
import Image from "next/image";
import { useUserStore } from "@/store";

const stories = [
  { name: "Create story", type: "create" },
  {
    name: "John Doe",
    img: "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    name: "Luke Coleman",
    img: "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    name: "Lisa Karamine",
    img: "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    name: "Michael Jackson",
    img: "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
  {
    name: "Bruno Fanardes",
    img: "https://i.pinimg.com/736x/fc/d1/50/fcd15099c68fa9895e151ad2ec141f30.jpg",
  },
];

export default function StorySlider() {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { user } = useUserStore();

  return (
    <>
      {user && (
        <>
          <div className="w-full py-2 relative">
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
              }}
              modules={[Navigation]}
            >
              {stories.map((story, index) => (
                <SwiperSlide
                  key={index}
                  className="h-full select-none cursor-pointer"
                >
                  {" "}
                  {story.type === "create" ? (
                    <div
                      className="relative flex flex-col bg-white items-center justify-end 
              h-48 p-3 text-center rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gray-100 overflow-hidden">
                        <Image
                          src={user.profile.avatar_url}
                          alt={
                            user.profile.first_name +
                            " " +
                            user.profile.last_name
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                          className="object-cover filter blur-sm opacity-90"
                        />
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-2">
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
                            className="rounded-full border-4 border-white"
                          />
                          <div
                            className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full
                     text-white w-6 h-6 flex items-center justify-center text-sm border-2 border-white"
                          >
                            +
                          </div>
                        </div>

                        <div className="bg-white px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                          <p className="text-gray-800 text-xs font-medium">
                            Create Story
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 relative rounded-lg overflow-hidden">
                      <Image
                        src={story.img as string}
                        alt={story.name}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        fill
                        className="object-cover"
                      />

                      <div
                        className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t 
                from-black/60 to-transparent"
                      >
                        <p className="text-white text-sm font-medium">
                          {story.name}
                        </p>
                      </div>
                      <div className="absolute top-2 left-2 border-2 border-blue-500 rounded-full">
                        <Image
                          height={35}
                          width={35}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          src="https://i.pravatar.cc/40"
                          alt="avatar"
                          className="rounded-full"
                        />
                      </div>
                    </div>
                  )}
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
        </>
      )}
    </>
  );
}
