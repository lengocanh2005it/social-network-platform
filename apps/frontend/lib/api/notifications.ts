import { DeleteNotificationQueryDto, GetNotificationsQueryDto } from "@/utils";
import axios from "@/lib/axios";

export const getNotifications = async (
  getNotificationsQueryDto?: GetNotificationsQueryDto,
) => {
  const response = await axios.get(`/notifications`, {
    params: getNotificationsQueryDto,
  });

  return response.data;
};

export const viewNotification = async (notificationId: string) => {
  const response = await axios.get(`/notifications/${notificationId}`);

  return response.data;
};

export const deleteNotification = async (
  deleteNotificationQueryDto: DeleteNotificationQueryDto,
) => {
  const response = await axios.delete("/notifications", {
    params: deleteNotificationQueryDto,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};
