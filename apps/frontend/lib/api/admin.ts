import axios from "@/lib/axios";
import { GetActivitiesQueryDto } from "@/utils";

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
