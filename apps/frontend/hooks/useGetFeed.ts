import { getMyFeed } from "@/lib/api/users";
import { GetFeedQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetFeed = (
  username: string,
  getFeedQueryDto?: GetFeedQueryDto,
) => {
  return useQuery({
    queryKey: [`feed/${username}`],
    queryFn: () => getMyFeed(username, getFeedQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!username,
  });
};
