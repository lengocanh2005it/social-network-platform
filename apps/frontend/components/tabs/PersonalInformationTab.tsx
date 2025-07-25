import { FullUserType } from "@/store";
import { Badge, Card } from "@heroui/react";
import { format } from "date-fns";
import { User } from "lucide-react";
import React from "react";

interface PersonalInformationTabProps {
  viewedUser: FullUserType;
}

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  viewedUser,
}) => {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User size={20} className="text-primary-500" />
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-default-600 mb-3 pb-2 border-b border-default-100">
            Basic Info
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Username:</span>
              <span>{viewedUser.profile.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Gender:</span>
              <span className="capitalize">{viewedUser.profile.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Theme:</span>
              <Badge color="primary" variant="flat">
                {viewedUser.profile.theme}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-default-600 mb-3 pb-2 border-b border-default-100">
            Additional Info
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Member Since:</span>
              <span>
                {format(
                  new Date(viewedUser.profile.created_at),
                  "MMM dd, yyyy",
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Active:</span>
              <span>2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Status:</span>
              <Badge
                color={
                  viewedUser.profile.status === "active" ? "success" : "danger"
                }
                variant="flat"
              >
                {viewedUser.profile.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInformationTab;
