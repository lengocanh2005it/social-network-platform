"use client";
import FriendsContent from "@/components/FriendContent";
import LoadingComponent from "@/components/loading/LoadingComponent";
import { Suspense } from "react";

export default function FriendsPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <FriendsContent />
    </Suspense>
  );
}
