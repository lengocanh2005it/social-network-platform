"use client";
import { Button } from "@heroui/react";
import { ChevronDownIcon } from "lucide-react";

type Props = {
  onClick: () => void;
  isLoading?: boolean;
};

export const LoadMoreButton = ({ onClick, isLoading }: Props) => (
  <div className="flex justify-center mt-4 transition-all">
    <Button
      onPress={onClick}
      endContent={<ChevronDownIcon className="h-4 w-4" />}
      isLoading={isLoading}
      color="primary"
      className="dark:bg-white/70 dark:text-black"
    >
      Load More
    </Button>
  </div>
);
