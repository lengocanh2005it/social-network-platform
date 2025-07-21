"use client";
import { motion } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { Typewriter } from "react-simple-typewriter";

const HeroSection = () => {
  const router = useRouter();

  const handleClickNext = () => {
    router.push("/auth/sign-in");
  };

  return (
    <section
      className="h-screen flex flex-col items-center justify-center 
    text-center px-4 md:gap-4 gap-3 relative"
    >
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r 
        from-indigo-500 to-fuchsia-500 text-transparent bg-clip-text select-none"
      >
        Social Network Platform
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeInOut" }}
        className="md:max-w-xl max-w-full text-center text-gray-400 dark:text-gray-400 text-medium"
      >
        Connect, share, and grow your social circle. The modern way to interact
        online.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
        className="inline-flex items-center gap-1 bg-indigo-600 text-white px-6 py-3 
  rounded-full shadow-lg hover:bg-indigo-700 transition cursor-pointer select-none
  hover:scale-[1.1] duration-300 ease-in-out scale-[0.9]"
        onClick={handleClickNext}
      >
        <span>
          <Typewriter
            words={["Get Started"]}
            loop
            cursor
            typeSpeed={100}
            deleteSpeed={30}
            delaySpeed={1400}
          />
        </span>
        <ArrowRight size={18} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{
          opacity: 1,
          y: [0, 10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: "easeInOut",
        }}
        className="absolute bottom-10"
      >
        <Mouse className="text-gray-400 dark:text-gray-400" size={28} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
