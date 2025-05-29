"use client";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { useGetProfile } from "@/hooks";
import { useUserStore } from "@/store";
import React, { useEffect } from "react";

interface ProfileWrapperProps {
  username: string;
  children: React.ReactNode;
}

const ProfileWrapper: React.FC<ProfileWrapperProps> = ({
  username,
  children,
}) => {
  const { setViewedUser, setRelationship } = useUserStore();

  const { data, isLoading } = useGetProfile(username, {
    includeProfile: true,
    includeEducations: true,
    includeSocials: true,
    includeWorkPlaces: true,
  });

  useEffect(() => {
    if (data) {
      setViewedUser(data);
      console.log(data);
    }
    if (data?.relationship) setRelationship(data.relationship);
  }, [data, setViewedUser, setRelationship]);

  if (isLoading) return <LoadingComponent />;

  return <>{children}</>;
};

export default ProfileWrapper;
