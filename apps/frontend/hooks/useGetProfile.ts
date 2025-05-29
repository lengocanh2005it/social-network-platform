import { getProfile } from "@/lib/api/users";
import { GetUserQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetProfile = (
  username: string,
  getUserQueryDto?: GetUserQueryDto,
) => {
  return useQuery({
    queryKey: [`profile/${username}`],
    queryFn: () => getProfile(username, getUserQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
