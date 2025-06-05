import { getMessagesOfConversation } from "@/lib/api/conversations";
import { GetMessagesQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetMessagesOfConversation = (
  userId: string,
  conversationId: string,
  getMessagesQueryDto?: GetMessagesQueryDto,
) => {
  return useQuery({
    queryKey: [`/conversations/${conversationId}/messages/?userId=${userId}`],
    queryFn: () =>
      getMessagesOfConversation(conversationId, getMessagesQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId && !!conversationId,
  });
};
