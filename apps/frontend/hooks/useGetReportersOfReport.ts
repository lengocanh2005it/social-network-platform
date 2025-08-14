import { getReportersOfReport } from "@/lib/api/admin";
import { GetReportersOfReportQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetReportersOfReport = (
  userId: string,
  targetId: string,
  getReportersOfReportQueryDto: GetReportersOfReportQueryDto,
) => {
  return useQuery({
    queryKey: [
      `${userId}/dashboard/reports/${targetId}/reporters`,
      getReportersOfReportQueryDto,
    ],
    queryFn: () => getReportersOfReport(getReportersOfReportQueryDto, targetId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!userId && !!targetId,
  });
};
