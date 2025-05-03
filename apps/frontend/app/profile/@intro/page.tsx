"use client";
import SocialsIntro from "@/components/SocialsIntro";
import { Button } from "@heroui/react";

const ProfileIntroSection = () => {
  return (
    <section className="w-full flex flex-col md:gap-2 gap-1">
      <h1 className="font-medium md:text-xl text-lg">Intro</h1>

      <div className="w-full flex-1 flex flex-col md:p-3 p-2 md:gap-2 gap-1">
        <p className="text-center text-gray-700">
          A Software Engineer has more 3 years experience with React.js and
          Node.js
        </p>

        <Button color="primary">Edit bio</Button>
      </div>

      <SocialsIntro />
    </section>
  );
};

export default ProfileIntroSection;
