import BlockedUsersList from "@/components/BlockedUsersList";
import React from "react";

const BlockedUsersSettings: React.FC = () => {
  return (
    <main className="flex flex-col md:gap-6 gap-4">
      <div className="flex flex-col md:gap-1">
        <h2 className="text-xl font-semibold">Blocked Users</h2>

        <p className="text-gray-600 dark:text-white/70">
          Manage the users you have blocked from contacting you.
        </p>
      </div>

      <BlockedUsersList />
    </main>
  );
};

export default BlockedUsersSettings;
