import axios from "@/lib/axios";
import {
  GetActivitiesQueryDto,
  GetUsersDashboardQueryDto,
  UpdateUserSuspensionData,
} from "@/utils";

export const getActivities = async (
  getActivitiesQueryDto: GetActivitiesQueryDto,
) => {
  const response = await axios.get(`/admin/dashboard/activities`, {
    params: getActivitiesQueryDto,
  });

  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`/admin/dashboard/stats`);

  return response.data;
};

export const getGrowthOverview = async () => {
  const response = await axios.get(`/admin/dashboard/growth`);

  return response.data;
};

export const getUsersDashboard = async (
  getUsersDashboardQueryDto: GetUsersDashboardQueryDto,
) => {
  const response = await axios.get(`/admin/dashboard/users`, {
    params: getUsersDashboardQueryDto,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};

export const updateUserSuspension = async (
  updateUserSuspensionData: UpdateUserSuspensionData,
) => {
  const { userId, updateUserSuspensionDto } = updateUserSuspensionData;

  const response = await axios.patch(
    `/admin/dashboard/users/${userId}/suspension`,
    updateUserSuspensionDto,
  );

  return response.data;
};
