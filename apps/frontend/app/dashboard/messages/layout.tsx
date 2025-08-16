import ContactsSidebar from "@/components/sidebar/ContactsSidebar";
import React from "react";

export default function MessagesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-full w-full relative md:gap-4 gap-3">
      <ContactsSidebar />
      {children}
    </main>
  );
}
