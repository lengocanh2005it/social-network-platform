"use client";
import CallToActionSection from "@/components/section/CallToActionSection";
import FAQSection from "@/components/section/FAQSection";
import FeaturesSection from "@/components/section/FeaturesSection";
import FooterSection from "@/components/section/FooterSection";
import HeroSection from "@/components/section/HeroSection";
import SliderSection from "@/components/section/SliderSection";
import TestimonialsSection from "@/components/section/TestimonialsSection";
import React, { useEffect } from "react";

const HomePage: React.FC = () => {
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie =
        name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  }, []);

  return (
    <main
      className="w-full min-h-screen bg-gradient-to-br from-blue-50 
    to-purple-100 dark:from-black dark:to-neutral-900 text-gray-900 
    dark:text-white transition-colors duration-500"
    >
      <HeroSection />
      <FeaturesSection />
      <SliderSection />
      <TestimonialsSection />
      <FAQSection />
      <CallToActionSection />
      <FooterSection />
    </main>
  );
};

export default HomePage;
