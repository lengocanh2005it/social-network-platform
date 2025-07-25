import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export const EmptyState = ({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
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
          {hasActiveFilters
            ? "No users match your filters"
            : "No users available"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {hasActiveFilters
            ? "Try adjusting or clearing your filters."
            : "There aren’t any users to display at the moment."}
        </p>
      </div>

      {hasActiveFilters && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline" size="sm">
          Clear filters
        </Button>
      )}
    </div>
  );
};
