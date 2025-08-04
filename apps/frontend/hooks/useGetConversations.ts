import { getConversations } from "@/lib/api/conversations";
import { GetConversationsQueryDto } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetConversations = (
  userId: string,
  queryParams?: Omit<GetConversationsQueryDto, "after">,
) => {
  return useInfiniteQuery({
    queryKey: [
      "conversations",
      userId,
      queryParams ? JSON.stringify(queryParams) : "",
    ],
    queryFn: ({ pageParam = null }) =>
      getConversations({
        ...queryParams,
        after: pageParam ? pageParam : undefined,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
