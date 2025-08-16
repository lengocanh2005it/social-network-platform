"use client";
import ReportCardDetails from "@/components/ReportCardDetails";
import ReportCardHeader from "@/components/ReportCardHeader";
import ReportPosDetails from "@/components/ReportPosDetails";
import ReportStoryDetails from "@/components/ReportStoryDetails";
import { ReportsDashboardType } from "@/utils";
import { ReportTypeEnum } from "@repo/db";
import React from "react";

interface ReportCardProps {
  report: ReportsDashboardType;
  setReports: React.Dispatch<React.SetStateAction<ReportsDashboardType[]>>;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, setReports }) => {
  const renderContent = () => {
    if (report.type === ReportTypeEnum.post && report.post) {
      return <ReportPosDetails report={report} />;
    }
    if (report.type === ReportTypeEnum.story && report.story) {
      return <ReportStoryDetails report={report} />;
    }
    return null;
  };

  return (
    <div
      className="border dark:border-gray-700 rounded-lg p-5 bg-white 
    dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <ReportCardHeader report={report} setReports={setReports} />
      {renderContent()}
      <ReportCardDetails report={report} />
    </div>
  );
};

export default ReportCard;
