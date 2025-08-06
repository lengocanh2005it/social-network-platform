import { Card, Skeleton } from "@heroui/react";

const StatCardSkeleton = () => {
  return (
    <Card
      className="space-y-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 
    dark:border-gray-700"
      radius="lg"
    >
      <Skeleton className="rounded-lg">
        <div className="h-6 w-1/2 bg-default-300 dark:bg-gray-200 rounded-lg" />
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-8 w-2/3 bg-default-300 dark:bg-gray-300 rounded-lg" />
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-5 w-1/3 bg-default-300 dark:bg-gray-200 rounded-lg" />
      </Skeleton>
    </Card>
  );
};

export default StatCardSkeleton;
