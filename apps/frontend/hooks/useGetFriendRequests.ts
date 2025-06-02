import { getFriendRequests } from "@/lib/api/users";
import { useQuery } from "@tanstack/react-query";

export const useGetFriendRequests = (userId: string) => {
  return useQuery({
    queryKey: [`${userId}/friend-requests`],
    queryFn: () => getFriendRequests(),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
