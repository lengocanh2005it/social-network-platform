"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CallToActionSection = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleClickNext = () => {
    router.push("/auth/sign-in");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden py-20 px-6 sm:px-10 rounded-3xl 
        max-w-6xl mx-auto mt-24 shadow-2xl bg-gradient-to-br from-indigo-600 
        via-purple-600 to-pink-500 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)]" />
      <div className="relative text-center space-y-6 z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight drop-shadow-sm">
          Ready to build your social universe?
        </h2>
        <p className="max-w-2xl mx-auto text-medium sm:text-lg text-white/90">
          Join thousands of users already creating, sharing, and growing their
          online presence.
        </p>
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.97 }}
          className="relative inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold 
            px-7 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg transition-all duration-300 group 
            overflow-hidden cursor-pointer"
          onClick={handleClickNext}
        >
          <span className="z-10">Join Now</span>
          <ArrowRight className="w-5 h-5 z-10" />
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent 
              opacity-0 group-hover:opacity-100 transition duration-700 blur-sm"
          />
        </motion.button>
      </div>
    </motion.section>
  );
};

export default CallToActionSection;
