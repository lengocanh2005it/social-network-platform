import { FullUserType } from "@/store";
import { Card } from "@heroui/react";
import { Globe, Link2 } from "lucide-react";
import React from "react";

interface SocialMediaTabProps {
  viewedUser: FullUserType;
}

const SocialMediaTab: React.FC<SocialMediaTabProps> = ({ viewedUser }) => {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Globe size={20} className="text-success-500" />
        Social Media Connections
      </h3>

      {viewedUser.socials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {viewedUser.socials.map((social) => (
            <a
              key={social.id}
              href={social.social_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card
                className="p-3 hover:shadow-md transition-shadow"
                isPressable
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                    <Link2 size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">{social.social_name}</h4>
                    <p className="text-default-500 text-sm truncate">
                      {social.social_link}
                    </p>
                  </div>
                </div>
              </Card>
            </a>
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
