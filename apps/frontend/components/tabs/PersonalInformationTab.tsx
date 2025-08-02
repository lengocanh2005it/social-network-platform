import { FullUserType } from "@/store";
import { Card, Divider } from "@heroui/react";
import { format } from "date-fns";
import {
  Calendar,
  Contact2,
  Hash,
  Mail,
  MapPin,
  Palette,
  Phone,
  User,
  VenusAndMars,
} from "lucide-react";
import React from "react";

interface PersonalInformationTabProps {
  viewedUser: FullUserType;
}

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  viewedUser,
}) => {
  const infoItems = [
    {
      icon: <Mail size={20} className="dark:text-white/60 text-gray-500" />,
      label: "Email",
      value: viewedUser.email,
    },
    {
      icon: <Phone size={20} className="dark:text-white/60 text-gray-500" />,
      label: "Phone number",
      value: viewedUser.profile.phone_number,
    },
    {
      icon: <Hash size={20} className="text-gray-500 dark:text-white/60" />,
      label: "Username",
      value: viewedUser.profile.username,
    },
    ...(viewedUser?.profile?.nickname
      ? [
          {
            icon: (
              <Contact2
                size={20}
                className="dark:text-white/60 text-gray-500"
              />
            ),
            label: "Nickname",
            value: viewedUser?.profile.nickname,
          },
        ]
      : []),
    {
      icon: (
        <VenusAndMars size={24} className="text-gray-500 dark:text-white/60" />
      ),
      label: "Gender",
      value: viewedUser.profile.gender
        ? viewedUser.profile.gender.charAt(0).toUpperCase() +
          viewedUser.profile.gender.slice(1)
        : "Not specified",
    },
    {
      icon: <Palette size={20} className="text-gray-500 dark:text-white/60" />,
      label: "Theme",
      value: viewedUser.profile.theme,
    },
    {
      icon: <Calendar size={20} className="text-gray-500 dark:text-white/60" />,
      label: "Date of birth",
      value: format(new Date(viewedUser.profile.dob), "MMM dd, yyyy"),
    },
    {
      icon: <MapPin size={20} className="dark:text-white/60 text-gray-500" />,
      label: "Address",
      value: viewedUser.profile.address,
    },
  ];

  return (
    <Card className="p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-1 mb-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <User size={20} className="text-primary-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h3>
      </div>

      <Divider className="dark:bg-white/20 mb-3" />

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-3">
        {infoItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <div
              className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 
            rounded-lg transition-colors dark:border dark:border-white/10"
            >
              <div className="mt-0.5">{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="text-gray-900 dark:text-white mt-1">
                  {item.value}
                </p>
              </div>
            </div>

            {(index + 1) % 3 === 0 && index !== infoItems.length - 1 && (
              <Divider
                className="md:hidden col-span-2 my-2"
                orientation="horizontal"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default PersonalInformationTab;
