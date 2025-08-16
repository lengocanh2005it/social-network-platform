"use client";
import { Inbox, SearchX } from "lucide-react";
import React from "react";

interface EmptyActivitiesStateProps {
  searchTerm: string;
}

const EmptyActivitiesState: React.FC<EmptyActivitiesStateProps> = ({
  searchTerm,
}) => {
  return (
    <div className="text-center py-12 flex flex-col items-center h-[300px] justify-center">
      {searchTerm.trim() ? (
        <>
          <SearchX className="w-10 h-10 text-gray-400 mb-2" />
          <h2 className="text-lg font-semibold">No Results Found</h2>
          <p>We couldn&apos;t find any activities matching your search.</p>
        </>
      ) : (
        <>
          <Inbox className="w-10 h-10 text-gray-400 mb-2" />
          <h2 className="text-lg font-semibold">Empty Activities</h2>
          <p>No recent activities found. Check back later.</p>
        </>
      )}
    </div>
  );
};

export default EmptyActivitiesState;
