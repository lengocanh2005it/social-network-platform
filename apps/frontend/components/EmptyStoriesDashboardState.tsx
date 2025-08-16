"use client";
import { Button } from "@heroui/react";
import { SearchX } from "lucide-react";
import React from "react";

interface EmptyStoriesDashboardStateProps {
  hasActiveFilter: boolean;
  onClearFilter?: () => void;
}

const EmptyStoriesDashboardState: React.FC<EmptyStoriesDashboardStateProps> = ({
  hasActiveFilter,
  onClearFilter,
}) => {
  return (
    <div
      className="col-span-full text-center py-16 flex flex-col items-center 
    justify-center space-y-4"
    >
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
        <SearchX className="h-10 w-10 text-gray-400 dark:text-gray-500" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {hasActiveFilter
            ? "No stories match your filters"
            : "No stories available"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {hasActiveFilter
            ? "Try adjusting or clearing your filters."
            : "There aren't any  to display at the moment."}
        </p>
      </div>

      {hasActiveFilter && onClearFilter && (
        <Button onPress={onClearFilter} size="sm" variant="flat">
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default EmptyStoriesDashboardState;
