import { MessageCircleOff } from "lucide-react";
import React from "react";

const EmptyDefault: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4 h-full">
      <MessageCircleOff className="w-12 h-12 text-gray-400 mb-4" />

      <h1 className="text-medium font-semibold text-gray-700">
        No conversations yet
      </h1>
      <p className="text-gray-500 mt-2 text-sm text-center">
        Start a chat with a friend and your messages will appear here.
      </p>
    </div>
  );
};

export default EmptyDefault;
