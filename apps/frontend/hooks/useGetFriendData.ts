import { getFriendsList } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { FriendListType, GetFriendsListQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useFriendList = (
  type: FriendListType,
  enabled: boolean,
  options?: Partial<GetFriendsListQueryDto>,
) => {
  const { user } = useUserStore();

  return useQuery({
    queryKey: [`${user?.id}/friend-list`, type],
    queryFn: () =>
      getFriendsList({
        username: user?.profile?.username ?? "",
        type,
        ...options,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!user?.id && enabled,
  });
};
