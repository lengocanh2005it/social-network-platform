import { SearchX } from "lucide-react";
import React from "react";

const EmptySearch: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4 h-full">
      <SearchX className="w-12 h-12 text-gray-400 mb-4 dark:text-white/80" />
      <h1 className="text-medium font-semibold text-gray-700 dark:text-white/80">
        No result found
      </h1>
      <p className="text-gray-500 dark:text-white/60 mt-2 text-sm text-center">
        We couldn&apos;t find any conversations matching your search.
      </p>
    </div>
  );
};

export default EmptySearch;
