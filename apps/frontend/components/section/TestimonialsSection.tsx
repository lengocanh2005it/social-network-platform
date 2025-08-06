"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const testimonials = [
  {
    name: "John Doe",
    role: "Product Designer",
    content:
      "This platform has completely transformed the way I connect with others online!",
    avatar:
      "https://res.cloudinary.com/daiqcjyk9/image/upload/v1752394152/profile-2-cbdb3333-fce3-4477-b940-616d6fac0d1d.png",
  },
  {
    name: "Jane Smith",
    role: "Software Engineer",
    content:
      "Beautiful UI, seamless interactions. It's the future of social networks!",
    avatar:
      "https://res.cloudinary.com/daiqcjyk9/image/upload/v1752430388/profile-1-84a3b0e3-1744-456a-aa15-8679cfa0d618.png",
  },
  {
    name: "Alex Johnson",
    role: "Freelancer",
    content:
      "The best experience I’ve had with a social app. Clean, fast, and super intuitive!",
    avatar:
      "https://res.cloudinary.com/daiqcjyk9/image/upload/v1752163965/profile-3-d548ff0d-ec9c-411a-8c46-ad084850ee13.png",
  },
  {
    name: "Alex Johnson",
    role: "Freelancer",
    content:
      "The best experience I’ve had with a social app. Clean, fast, and super intuitive!",
    avatar:
      "https://res.cloudinary.com/daiqcjyk9/image/upload/v1751993736/profile-4-ef90bb5b-810a-402f-98fb-ef40798f73ab.png",
  },
];

const TestimonialsSection = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="py-20 bg-white dark:bg-neutral-950 text-center relative">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white"
      >
        What People Are Saying
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
      >
        Hear directly from our users about how the platform is changing the way
        they connect and engage.
      </motion.p>

      <div className="relative max-w-4xl mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={30}
          slidesPerView={3}
          pagination={{ clickable: true }}
          loop
          onBeforeInit={(swiper) => {
            if (
              swiper.params.navigation &&
              typeof swiper.params.navigation !== "boolean"
            ) {
              swiper.params.navigation.prevEl = ".swiper-prev";
              swiper.params.navigation.nextEl = ".swiper-next";
            }
          }}
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 bg-gray-100 dark:bg-neutral-800 rounded-xl shadow-lg cursor-pointer"
              >
                <div className="mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 select-none"
                  />
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.role}
                  </p>
                </div>
                <p className="text-gray-700 dark:text-gray-200 italic">
                  &quot;{t.content}&quot;
                </p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 z-10">
            <button
              className="swiper-prev p-2 bg-indigo-600 hover:bg-indigo-700 
              text-white rounded-full shadow transition cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
            <button
              className="swiper-next p-2 bg-indigo-600 hover:bg-indigo-700 
              text-white rounded-full shadow transition cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
