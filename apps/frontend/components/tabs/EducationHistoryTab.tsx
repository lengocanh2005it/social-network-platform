import { FullUserType } from "@/store";
import { Card, Chip, Divider } from "@heroui/react";
import { GraduationCap } from "lucide-react";
import React from "react";

interface EducationHistoryTabProps {
  viewedUser: FullUserType;
  formatDate: (date: Date | null) => string;
}

const EducationHistoryTab: React.FC<EducationHistoryTabProps> = ({
  viewedUser,
  formatDate,
}) => {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <GraduationCap size={20} className="text-warning-500" />
        Education History
      </h3>

      <Divider className="dark:bg-white/20 mb-3" />

      {viewedUser.educations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {viewedUser.educations.map((edu) => (
            <Card
              key={edu.id}
              className="p-4 hover:shadow-md transition-shadow dark:border dark:border-white/10"
              isPressable
            >
              <div className="flex gap-4 justify-between">
                <div className="flex flex-col text-left">
                  <h4 className="font-semibold">{edu.school_name}</h4>
                  <p className="text-default-500">
                    {edu.major} ({edu.degree})
                  </p>
                </div>
                <div className="text-sm text-default-500 whitespace-nowrap">
                  {formatDate(edu.start_date)} → {formatDate(edu.end_date)}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Chip variant="dot" color="success" size="sm">
                  Graduated
                </Chip>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <GraduationCap size={48} className="mx-auto text-default-300 mb-4" />
          <h4 className="text-lg font-medium">No education information</h4>
          <p className="text-default-500 mt-2">
            This user hasn&apos;t added any education details yet.
          </p>
        </div>
      )}
    </Card>
  );
};

export default EducationHistoryTab;
