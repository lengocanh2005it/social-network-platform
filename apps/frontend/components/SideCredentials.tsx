"use client";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

const SideCredentials = () => {
  const bannerImages = [
    { src: "/banners/banner-1.jpg", alt: "Banner 1" },
    { src: "/banners/banner-2.jpg", alt: "Banner 2" },
    { src: "/banners/banner-3.jpg", alt: "Banner 3" },
    { src: "/banners/banner-4.jpg", alt: "Banner 4" },
  ];

  return (
    <div
      className="md:w-1/2 w-full h-fit relative flex-col flex items-center 
    justify-center md:gap-4 gap-2"
    >
      <div className="flex flex-col md:gap-2 gap-1 items-center justify-center text-center">
        <h1 className="md:text-xl text-lg">Social Network Platform</h1>

        <p className="md:text-sm text-[14px] text-black/60 dark:text-white/70">
          A platform used to build communities, connect with people who share
          similar interests, and share exciting stories.
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        loop
        className="rounded-xl md:w-full w-[90%] md:h-[65vh] h-[30vh] mx-auto relative"
      >
        {bannerImages.map((banner, index) => (
          <SwiperSlide key={index} className="select-none">
            <Image
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={banner.src}
              alt={banner.alt}
              fill
              priority
              className="cursor-pointer object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SideCredentials;
