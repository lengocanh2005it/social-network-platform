import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessagesOfConversation } from "@/lib/api/conversations";
import { GetMessagesQueryDto } from "@/utils";

export const useGetMessagesOfConversation = (
  userId: string,
  conversationId: string,
  initialQueryDto?: Omit<GetMessagesQueryDto, "after">,
) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId, userId],
    queryFn: ({ pageParam }) =>
      getMessagesOfConversation(conversationId, {
        ...initialQueryDto,
        after: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId && !!conversationId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
