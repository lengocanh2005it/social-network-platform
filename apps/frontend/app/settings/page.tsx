"use client";
import BlockedUsersSettings from "@/components/settings/BlockedUsersSettings";
import DeleteAccountSettings from "@/components/settings/DeleteAccountSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { useState } from "react";

const tabs = [
  { key: "general", label: "General" },
  { key: "security", label: "Security" },
  { key: "blocked", label: "Blocked Users" },
  { key: "data", label: "Account Deletion" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="px-4 py-4 flex flex-col md:gap-6 gap-4 dark:text-white text-black">
      <div className="flex flex-col md:gap-1">
        <h1 className="text-2xl font-bold">Settings</h1>

        <p className="text-gray-500 dark:text-white/80">
          Manage your preferences and account settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-6">
        <div
          className="flex md:flex-col gap-2 md:w-1/4 border-b md:border-b-0 md:border-r md:pr-4
        dark:md:border-r dark:md:border-r-white/20"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`text-left px-3 py-2 rounded-md text-sm cursor-pointer
                 font-medium transition-colors focus:outline-none
                ${
                  activeTab === tab.key
                    ? "bg-gray-100 text-black font-semibold dark:bg-white/20 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/30"
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:w-3/4 w-full">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "blocked" && <BlockedUsersSettings />}
          {activeTab === "data" && <DeleteAccountSettings />}
        </div>
      </div>
    </div>
  );
}
