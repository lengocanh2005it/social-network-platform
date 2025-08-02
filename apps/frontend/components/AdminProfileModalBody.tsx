"use client";
import EditImageButton from "@/components/button/EditImageButton";
import EditDetailsInformationForm from "@/components/form/EditDetailsInformationForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/store";
import Image from "next/image";
import React from "react";

interface AdminProfileModalBodyProps {
  onClose: () => void;
}

const AdminProfileModalBody: React.FC<AdminProfileModalBodyProps> = ({
  onClose,
}) => {
  const { user } = useUserStore();

  return (
    <>
      {user && (
        <>
          <ScrollArea className="h-[600px]">
            <main className="flex flex-col-reverse md:gap-5 gap-4">
              <EditDetailsInformationForm onCancel={onClose} />

              <div className="relative flex items-center justify-center w-fit mx-auto">
                <Image
                  src={user.profile.avatar_url}
                  alt="Avatar"
                  width={125}
                  height={125}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-full border-4 border-white object-cover 
                    select-none cursor-pointer"
                />

                <EditImageButton type="avatar" classNames="right-2 -bottom-2" />
              </div>
            </main>
          </ScrollArea>
        </>
      )}
    </>
  );
};

export default AdminProfileModalBody;
