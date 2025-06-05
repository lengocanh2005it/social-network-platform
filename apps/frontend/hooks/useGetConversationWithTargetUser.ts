import { getConversationWithTargetUser } from "@/lib/api/conversations";
import { useQuery } from "@tanstack/react-query";

export const useGetConversationWithTargetUser = (
  currentUserId: string,
  targetUserId: string,
) => {
  return useQuery({
    queryKey: [`${currentUserId}/conversations/${targetUserId}`],
    queryFn: () => getConversationWithTargetUser(targetUserId),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!currentUserId && !!targetUserId,
  });
};
