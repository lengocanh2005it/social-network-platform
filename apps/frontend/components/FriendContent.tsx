"use client";
import NotFoundPage from "@/app/not-found";
import FriendDetailsList from "@/components/FriendDetailsList";
import FriendRequestsList from "@/components/FriendRequestsList";
import FriendSuggestionsList from "@/components/FriendSuggestionsList";
import { useFriendList } from "@/hooks";
import { FriendListType } from "@/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type TabItem = {
  key: FriendListType;
  label: string;
};

const tabs: TabItem[] = [
  { key: FriendListType.FRIENDS, label: "Your Friends" },
  { key: FriendListType.REQUESTS, label: "Friend Requests" },
  { key: FriendListType.SUGGESTIONS, label: "People May You Know" },
];

const validTabs: FriendListType[] = Object.values(FriendListType);

const FriendsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as FriendListType | null;
  const defaultTab = FriendListType.FRIENDS;
  const [activeTab, setActiveTab] = useState<FriendListType>(defaultTab);
  const [isInvalidTab, setIsInvalidTab] = useState<boolean>(false);

  useEffect(() => {
    if (!tabParam) {
      setActiveTab(defaultTab);
      router.replace(`/friends?tab=${defaultTab}`);
      setIsInvalidTab(false);
      return;
    }

    if (validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
      setIsInvalidTab(false);
    } else {
      setIsInvalidTab(true);
    }
  }, [tabParam, defaultTab, router]);

  const handleClick = (tab: TabItem) => {
    if (tab.key === activeTab) return;
    setActiveTab(tab.key);
    router.push(`/friends?tab=${tab.key}`);
  };

  const { data, isLoading } = useFriendList(
    isInvalidTab ? FriendListType.FRIENDS : activeTab,
    true,
  );

  const renderActiveComponent = () => {
    switch (activeTab) {
      case FriendListType.FRIENDS:
        return <FriendDetailsList data={data} isLoading={isLoading} />;
      case FriendListType.SUGGESTIONS:
        return <FriendSuggestionsList data={data} isLoading={isLoading} />;
      case FriendListType.REQUESTS:
        return <FriendRequestsList data={data} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  if (isInvalidTab) {
    return <NotFoundPage />;
  }

  return (
    <div className="px-6 flex flex-col md:gap-6 gap-4">
      <div className="flex flex-col md:gap-1">
        <h1 className="text-2xl font-bold">Friends</h1>
        <p className="text-gray-500">
          View your friends, respond to friend requests, and discover people you
          may know.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-6">
        <div className="flex md:flex-col gap-2 md:w-1/4 border-b md:border-b-0 md:border-r md:pr-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`text-left px-3 py-2 rounded-md text-sm cursor-pointer
                 font-medium transition-colors focus:outline-none
                ${
                  activeTab === tab.key
                    ? "bg-gray-100 text-black font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => handleClick(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:w-3/4 w-full">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default FriendsContent;
