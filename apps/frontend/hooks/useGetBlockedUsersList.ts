import { getBlockedUsersList } from "@/lib/api/users";
import { GetBlockedUsersListQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetBlockedUsersList = (
  userId: string,
  getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/blocked-users-list`],
    queryFn: () => getBlockedUsersList(getBlockedUsersListQueryDto),
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
