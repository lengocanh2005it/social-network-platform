import { FullUserType } from "@/store";
import { Card, Divider } from "@heroui/react";
import clsx from "clsx";
import { Globe, Link2 } from "lucide-react";
import React from "react";
import { FaGithub, FaGlobe, FaInstagram, FaTwitter } from "react-icons/fa";
import { FiLink2 } from "react-icons/fi";

interface SocialMediaTabProps {
  viewedUser: FullUserType;
}

const getIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "github":
      return <FaGithub className="w-6 h-6" />;
    case "instagram":
      return <FaInstagram className="w-6 h-6" />;
    case "twitter":
      return <FaTwitter className="w-6 h-6" />;
    case "website":
      return <FaGlobe className="w-6 h-6" />;
    default:
      return <FiLink2 className="w-6 h-6" />;
  }
};

const SocialMediaTab: React.FC<SocialMediaTabProps> = ({ viewedUser }) => {
  const { socials } = viewedUser;

  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Globe size={20} className="text-success-500" />
        Social Media Connections
      </h3>

      <Divider className="dark:bg-white/20 mb-4" />

      {socials.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {socials.map((social) => (
            <Card
              key={social.id}
              className={clsx(
                "p-4 transition-all",
                "hover:shadow-md hover:border-primary-500",
                "border dark:border-white/10",
              )}
              isPressable
            >
              <div className="flex items-center gap-5">
                <div className="rounded-full">
                  {getIcon(social.social_name)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium capitalize">
                    {social.social_name}
                  </h4>
                  <a
                    href={social.social_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-default-500 text-sm truncate hover:underline block"
                  >
                    {social.social_link}
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Link2 size={48} className="mx-auto text-default-300 mb-4" />
          <h4 className="text-lg font-medium">No social links added</h4>
          <p className="text-default-500 mt-2">
            This user hasn&apos;t connected any social media accounts.
          </p>
        </div>
      )}
    </Card>
  );
};

export default SocialMediaTab;
