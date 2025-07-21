"use client";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const images = (process.env.NEXT_PUBLIC_APP_SCREEN_URLS ?? "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

const SliderSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900 relative">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white"
      >
        Take a Look Inside
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
      >
        Discover how our app works through real screens that showcase core
        features and smooth interactions.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
      >
        <div className="max-w-5xl mx-auto px-4 relative">
          <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 z-10">
            <button
              className="swiper-button-prev-custom bg-white/80 dark:bg-neutral-800 
          text-black dark:text-white p-2 rounded-full shadow-md 
          hover:scale-105 transition cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
            <button
              className="swiper-button-next-custom bg-white/80 dark:bg-neutral-800
           text-black dark:text-white p-2 rounded-full 
           shadow-md hover:scale-105 transition cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <Swiper
            spaceBetween={30}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            autoplay={{ delay: 4000 }}
            modules={[Pagination, Navigation, Autoplay]}
            className="rounded-xl overflow-hidden"
          >
            {images.map((src, idx) => (
              <SwiperSlide key={idx}>
                <motion.img
                  src={src}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-[450px] object-cover rounded-lg shadow-xl 
                select-none cursor-pointer"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>
    </section>
  );
};

export default SliderSection;
