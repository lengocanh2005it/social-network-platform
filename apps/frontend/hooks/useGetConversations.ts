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
    queryFn: ({ pageParam }) =>
      getConversations({
        ...queryParams,
        after: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
