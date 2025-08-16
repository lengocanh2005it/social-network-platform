import EducationHistoryTab from "@/components/tabs/EducationHistoryTab";
import PersonalInformationTab from "@/components/tabs/PersonalInformationTab";
import SocialMediaTab from "@/components/tabs/SocialMediaTab";
import WorkHistoryTab from "@/components/tabs/WorkHistoryTab";
import { FullUserType } from "@/store";
import { Tab, Tabs } from "@heroui/react";
import { format } from "date-fns";
import { Briefcase, GraduationCap, Link2, User } from "lucide-react";
import React from "react";

interface UserDetailsTabsProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
  viewedUser?: FullUserType;
}

const UserDetailsTabs: React.FC<UserDetailsTabsProps> = ({
  setActiveTab,
  activeTab,
  viewedUser,
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return "Present";
    return format(new Date(date), "MMM yyyy");
  };

  if (!viewedUser) return <p>Loading...</p>;

  return (
    <>
      <Tabs
        aria-label="User details"
        className="mt-5"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key.toString())}
        classNames={{
          tabList: "bg-transparent",
          cursor: "bg-primary-500",
          tab: "data-[hover=true]:bg-default-100",
          tabContent: "group-data-[selected=true]:font-bold",
        }}
      >
        <Tab
          key="profile"
          title={
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>Profile</span>
            </div>
          }
        >
          <PersonalInformationTab viewedUser={viewedUser} />
        </Tab>

        <Tab
          key="work"
          title={
            <div className="flex items-center gap-2">
              <Briefcase size={18} />
              <span>Experience</span>
            </div>
          }
        >
          <WorkHistoryTab viewedUser={viewedUser} formatDate={formatDate} />
        </Tab>

        <Tab
          key="education"
          title={
            <div className="flex items-center gap-2">
              <GraduationCap size={18} />
              <span>Education</span>
            </div>
          }
        >
          <EducationHistoryTab
            viewedUser={viewedUser}
            formatDate={formatDate}
          />
        </Tab>

        <Tab
          key="socials"
          title={
            <div className="flex items-center gap-2">
              <Link2 size={18} />
              <span>Social Links</span>
            </div>
          }
        >
          <SocialMediaTab viewedUser={viewedUser} />
        </Tab>
      </Tabs>
    </>
  );
};

export default UserDetailsTabs;
