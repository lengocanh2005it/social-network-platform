import { SideBar } from "@/components/SideBar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black dark:text-white">
      <SideBar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
