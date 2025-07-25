"use client";
import PrimaryLoading from "@/components/loading/PrimaryLoading";
import UserDetailsBody from "@/components/UserDetailsBody";
import UserDetailsCard from "@/components/UserDetailsCard";
import UserDetailsClientHeader from "@/components/UserDetailsClientHeader";
import UserDetailsTabs from "@/components/UserDetailsTabs";
import { useGetUserDashboard } from "@/hooks";
import { FullUserType, useUserStore } from "@/store";
import { Card, Divider } from "@heroui/react";
import { useEffect, useState } from "react";

const UserDetailsClient = ({ username }: { username: string }) => {
  const { user } = useUserStore();
  const { data, isLoading } = useGetUserDashboard(user?.id ?? "", username, {
    username,
    includeEducations: true,
    includeProfile: true,
    includeSocials: true,
    includeWorkPlaces: true,
  });
  const [viewedUser, setViewedUser] = useState<FullUserType | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (data) {
      setViewedUser(data);
    }
  }, [data, setViewedUser]);

  if (isLoading) return <PrimaryLoading />;

  const calculateProfileCompletion = () => {
    if (!viewedUser) return 0;
    let completedFields = 0;
    const totalFields = 8;

    if (viewedUser.profile.first_name) completedFields++;
    if (viewedUser.profile.last_name) completedFields++;
    if (viewedUser.profile.phone_number) completedFields++;
    if (viewedUser.profile.address) completedFields++;
    if (viewedUser.profile.dob) completedFields++;
    if (viewedUser.profile.bio) completedFields++;
    if (viewedUser.work_places.length > 0) completedFields++;
    if (viewedUser.educations.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <UserDetailsClientHeader />

      <Card className="p-6 mb-8 shadow-lg rounded-xl h-full relative">
        <div className="grid md:grid-cols-3 grid-cols-1 md:gap-6 gap-4">
          {viewedUser && (
            <>
              <UserDetailsCard
                viewedUser={viewedUser}
                profileCompletion={profileCompletion}
              />

              <div className="w-full h-full relative col-span-2">
                <UserDetailsBody viewedUser={viewedUser} />
              </div>
            </>
          )}
        </div>
      </Card>

      <Divider className="dark:bg-white/20" />

      {viewedUser && (
        <UserDetailsTabs
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          viewedUser={viewedUser}
        />
      )}
    </div>
  );
};

export default UserDetailsClient;
