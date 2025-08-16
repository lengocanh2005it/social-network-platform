import { getReports } from "@/lib/api/admin";
import { GetReportsQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetReportsDashboard = (
  userId: string,
  getReportsQueryDto: GetReportsQueryDto,
) => {
  return useQuery({
    queryKey: [
      `${userId}/dashboard/reports`,
      JSON.stringify(getReportsQueryDto),
    ],
    queryFn: () => getReports(getReportsQueryDto),
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
