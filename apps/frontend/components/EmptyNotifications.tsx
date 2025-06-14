import { Inbox } from "lucide-react";
import React from "react";

const EmptyNotifications: React.FC = () => {
  return (
    <div
      className="flex flex-col md:gap-2 gap-1 h-[150px] items-center 
    justify-center text-center text-gray-500"
    >
      <Inbox className="w-8 h-8 text-gray-400" />

      <div className="flex flex-col gap-1 items-center justify-center text-center">
        <h1 className="text-base font-semibold">No Notifications</h1>
        <p className="text-sm">You&apos;re all caught up!</p>
      </div>
    </div>
  );
};

export default EmptyNotifications;
