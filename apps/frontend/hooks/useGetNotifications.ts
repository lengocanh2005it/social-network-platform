import { getNotifications } from "@/lib/api/notifications";
import { GetNotificationsQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetNotifications = (
  userId: string,
  getNotificationsQueryDto?: GetNotificationsQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/notifications/${getNotificationsQueryDto?.is_read}`],
    queryFn: () => getNotifications(getNotificationsQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId && !!getNotificationsQueryDto,
  });
};
