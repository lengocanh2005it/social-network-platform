import { FullUserType } from "@/store";
import { Button, Card, Chip, Tooltip } from "@heroui/react";
import {
  Briefcase,
  GraduationCap,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import React from "react";

interface UserDetailsBodyProps {
  viewedUser: FullUserType;
  onMessage?: () => void;
}

const UserDetailsBody: React.FC<UserDetailsBodyProps> = ({
  viewedUser,
  onMessage,
}) => {
  const {
    profile: { first_name, last_name, username, bio, nickname },
    work_places,
    educations,
    socials,
    email,
  } = viewedUser;

  const contactInfo = [
    {
      key: 1,
      icon: <Mail size={18} className="text-primary-500" />,
      content: email,
      label: "Email",
    },
    {
      key: 2,
      icon: <Phone size={18} className="text-secondary-500" />,
      content: viewedUser.profile.phone_number,
      label: "Phone",
    },
    {
      key: 3,
      icon: <MapPin size={18} className="text-success-500" />,
      content: viewedUser.profile.address,
      label: "Address",
    },
  ];

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <User size={24} className="text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {first_name} {last_name}
              {nickname && (
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  ({nickname})
                </span>
              )}
            </h2>
          </div>
          <Tooltip content="Username" placement="left-start">
            <Chip variant="flat" color="primary" size="sm">
              @{username}
            </Chip>
          </Tooltip>
        </div>

        <Button
          variant="solid"
          color="primary"
          size="sm"
          startContent={<MessageSquare size={16} />}
          onPress={onMessage}
          className="min-w-[120px]"
        >
          Send Message
        </Button>
      </div>

      <Card className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {bio || (
            <span className="italic text-gray-400">
              This user hasn&apos;t added a bio yet.
            </span>
          )}
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Briefcase size={20} className="text-blue-500" />}
          count={work_places.length}
          label="Experiences"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<GraduationCap size={20} className="text-purple-500" />}
          count={educations.length}
          label="Educations"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          icon={<Link2 size={20} className="text-green-500" />}
          count={socials.length}
          label="Social Links"
          bg="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contactInfo.map((info) => (
            <Card
              key={info.key}
              className={`p-3 hover:shadow-md transition-shadow dark:border dark:border-white/10
              ${info.key === 3 && "col-span-2"}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-opacity-20 dark:bg-opacity-10">
                  {info.icon}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {info.label}
                  </p>
                  <Tooltip content={info.content || "Not provided"}>
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {info.content || "Not provided"}
                    </p>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  count,
  label,
  bg,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  bg: string;
}) => (
  <Card className="p-4 text-center hover:shadow-md transition-shadow dark:border dark:border-white/10">
    <div className="flex justify-center mb-2">
      <div className={`p-3 rounded-full ${bg}`}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </Card>
);

export default UserDetailsBody;
