import { Loader2 } from "lucide-react";
import React from "react";

const LoadingComponent: React.FC = () => {
  return (
    <div
      className="flex justify-center items-center h-screen w-full bg-gradient-to-br
     from-white via-blue-50 to-blue-100 dark:bg-black dark:text-white dark:from-black
     dark:to-black dark:via-black"
    >
      <div className="text-center space-y-4">
        <div
          className="inline-flex items-center justify-center rounded-full p-6 bg-white shadow-lg
            dark:text-black dark:bg-white"
        >
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
        <p className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
          Processing your request...
        </p>
        <p className="text-sm text-gray-500 dark:text-white/70">
          This might take a few seconds. Please wait...
        </p>
      </div>
    </div>
  );
};

export default LoadingComponent;
