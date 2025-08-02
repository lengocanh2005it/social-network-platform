import { getProfile } from "@/lib/api/users";
import { GetUserQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetUserDashboard = (
  userId: string,
  username: string,
  getUserQueryDto: GetUserQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/profile/${username}`],
    queryFn: () => getProfile(username, getUserQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!userId && !!username,
  });
};
