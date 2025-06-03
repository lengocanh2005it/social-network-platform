import { getFriendsList } from "@/lib/api/users";
import { GetFriendsListQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetFriendsList = (
  userId: string,
  getFriendsListQueryDto: GetFriendsListQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/friends-list`],
    queryFn: () => getFriendsList(getFriendsListQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
