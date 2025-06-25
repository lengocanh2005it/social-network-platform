import { getConversations } from "@/lib/api/conversations";
import { useQuery } from "@tanstack/react-query";

export const useGetConversations = (userId: string) => {
  return useQuery({
    queryKey: [`/conversations/?userid=${userId}`],
    queryFn: () => getConversations(),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
