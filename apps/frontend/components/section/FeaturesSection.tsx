"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "Instant Connections",
    description:
      "Effortlessly discover and connect with people who matter. Smart suggestions make finding friends faster than ever.",
  },
  {
    title: "Share Moments, Instantly",
    description:
      "Post photos, videos, and thoughts in real time. Capture your life’s highlights and share them with your world.",
  },
  {
    title: "Your Profile, Your Style",
    description:
      "Design a profile that truly represents you — from bios and interests to cover photos and themes.",
  },
  {
    title: "Built-In Privacy & Control",
    description:
      "Take charge of your data with advanced privacy settings, secure encryption, and full transparency.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Key Features
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 text-medium"
        >
          Explore the core functionalities designed to enhance your social
          experience.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 text-left">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="flex items-start gap-4 dark:hover:bg-white/10 
  p-4 rounded-2xl cursor-pointer border dark:border-white/20"
            >
              <CheckCircle className="text-indigo-600 w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
