"use client";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const faqs = [
  {
    question: "What makes this social platform different?",
    answer:
      "We focus on meaningful connections, minimal design, and user control — no distractions, just authentic interaction.",
  },
  {
    question: "Can I control who sees my posts?",
    answer:
      "Yes, you can set post visibility to public, friends-only, or private before publishing.",
  },
  {
    question: "Are there any ads?",
    answer:
      "No. Our platform is ad-free to ensure a clean and distraction-free experience.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "Every post and profile includes a report option. Our moderation team reviews reports promptly.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!isMounted) return null;

  return (
    <section className="py-24 bg-gray-50 dark:bg-neutral-950 transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white"
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
        >
          Got questions? We&apos;ve got answers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
          className="flex flex-col md:gap-4 gap-3"
        >
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border dark:border-white/20 bg-white 
                  dark:bg-neutral-900 shadow-sm transition-all duration-300 ${
                    isOpen ? "ring-1 ring-indigo-500" : ""
                  }`}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => handleToggle(i)}
                >
                  <span
                    className={`text-base md:text-lg font-medium ${
                      isOpen
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="text-indigo-600" />
                  ) : (
                    <ChevronDown className="text-gray-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
