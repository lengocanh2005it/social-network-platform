import { FullUserType } from "@/store";
import { Card, Chip, Divider } from "@heroui/react";
import { Briefcase } from "lucide-react";
import React from "react";

interface WorkHistoryTabProps {
  viewedUser: FullUserType;
  formatDate: (date: Date | null) => string;
}

const WorkHistoryTab: React.FC<WorkHistoryTabProps> = ({
  viewedUser,
  formatDate,
}) => {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Briefcase size={20} className="text-secondary-500" />
        Work History
      </h3>

      <Divider className="dark:bg-white/20 mb-3" />

      {viewedUser.work_places.length > 0 ? (
        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-3">
          {viewedUser.work_places.map((work) => (
            <Card
              key={work.id}
              className="p-4 hover:shadow-md transition-shadow dark:border dark:border-white/10"
              isPressable
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div className="flex flex-col items-start justify-start text-left">
                  <h4 className="font-semibold text-lg">{work.company_name}</h4>
                  <p className="text-default-500">{work.position}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip variant="dot" color="primary" size="sm">
                      Full-time
                    </Chip>
                    <Chip variant="dot" color="success" size="sm">
                      Remote
                    </Chip>
                  </div>
                </div>

                <div
                  className="text-sm text-default-500 bg-default-100 dark:bg-default-200 
                      px-3 py-1 rounded-full self-start sm:self-center"
                >
                  {formatDate(work.start_date)} → {formatDate(work.end_date)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Briefcase
            size={48}
            className="mx-auto text-default-300 mb-4 dark:text-white/70"
          />
          <h4 className="text-lg font-medium">No work experience added</h4>
          <p className="text-default-500 mt-2">
            This user hasn&apos;t added any work experiences yet.
          </p>
        </div>
      )}
    </Card>
  );
};

export default WorkHistoryTab;
