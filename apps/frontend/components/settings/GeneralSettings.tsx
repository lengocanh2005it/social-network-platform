"use client";
import EditImageButton from "@/components/button/EditImageButton";
import EditDetailsInformationForm from "@/components/form/EditDetailsInformationForm";
import { useUserStore } from "@/store";
import { Divider } from "@heroui/react";
import Image from "next/image";
import React from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const GeneralSettings: React.FC = () => {
  const { user } = useUserStore();

  return (
    <section className="flex flex-col relative md:gap-6 gap-4 h-full">
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold">General Settings</h2>
        <p className="text-gray-600">
          Update your name, email, and profile info.
        </p>
      </div>

      <Divider />

      <div
        className="relative flex items-start justify-between flex-1 h-full
      md:gap-4 gap-3"
      >
        <div className="w-[70%]">
          <EditDetailsInformationForm />
        </div>

        {user && user?.profile && (
          <div className="w-1/4">
            <PhotoProvider>
              <div className="relative">
                <PhotoView src={user.profile.avatar_url}>
                  <Image
                    src={user.profile.avatar_url}
                    alt="Avatar"
                    width={180}
                    height={180}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-full border-4 border-white object-cover 
                    select-none cursor-pointer"
                  />
                </PhotoView>

                <EditImageButton type="avatar" classNames="right-22" />
              </div>
            </PhotoProvider>
          </div>
        )}
      </div>
    </section>
  );
};

export default GeneralSettings;
