import { getMyFeed } from "@/lib/api/users";
import { GetFeedQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetFeed = (getFeedQueryDto?: GetFeedQueryDto) => {
  return useQuery({
    queryKey: ["feed/me"],
    queryFn: () => getMyFeed(getFeedQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
