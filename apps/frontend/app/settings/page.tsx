"use client";
import BlockedUsersSettings from "@/components/settings/BlockedUsersSettings";
import DeleteAccountSettings from "@/components/settings/DeleteAccountSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import NotificationsSettings from "@/components/settings/NotificationsSettings";
import PrivaciesSettings from "@/components/settings/PrivaciesSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { useState } from "react";

const tabs = [
  { key: "general", label: "General" },
  { key: "security", label: "Security" },
  { key: "privacy", label: "Privacy" },
  { key: "notification", label: "Notification" },
  { key: "blocked", label: "Blocked Users" },
  { key: "data", label: "Account Deletion" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="px-4 py-4 flex flex-col md:gap-6 gap-4">
      <div className="flex flex-col md:gap-1">
        <h1 className="text-2xl font-bold">Settings</h1>

        <p className="text-gray-500">
          Manage your preferences and account settings.
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
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:w-3/4 w-full">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "privacy" && <PrivaciesSettings />}
          {activeTab === "notification" && <NotificationsSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "blocked" && <BlockedUsersSettings />}
          {activeTab === "data" && <DeleteAccountSettings />}
        </div>
      </div>
    </div>
  );
}
