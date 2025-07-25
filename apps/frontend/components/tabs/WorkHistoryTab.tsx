import { FullUserType } from "@/store";
import { Card, Chip } from "@heroui/react";
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
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Briefcase size={20} className="text-secondary-500" />
        Work History
      </h3>

      {viewedUser.work_places.length > 0 ? (
        <div className="space-y-6">
          {viewedUser.work_places.map((work) => (
            <Card
              key={work.id}
              className="p-4 hover:shadow-md transition-shadow"
              isPressable
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
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
          <Briefcase size={48} className="mx-auto text-default-300 mb-4" />
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
