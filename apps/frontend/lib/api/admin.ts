import axios from "@/lib/axios";
import {
  GetActivitiesQueryDto,
  GetPostsDashboardQueryDto,
  GetReportersOfReportQueryDto,
  GetReportsQueryDto,
  GetSharesPostQueryDto,
  GetStoriesDashboardQueryDto,
  GetUsersDashboardQueryDto,
  UpdatePostStatusData,
  UpdateReportStatusDto,
  UpdateStoryStatusData,
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

export const getPostsDashboard = async (
  getPostsDashboardQueryDto: GetPostsDashboardQueryDto,
) => {
  const response = await axios.get(`/admin/dashboard/posts`, {
    params: getPostsDashboardQueryDto,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};

export const updatePostStatus = async (
  updatePostStatusData: UpdatePostStatusData,
) => {
  const { postId, updatePostStatusDto } = updatePostStatusData;

  const response = await axios.patch(
    `/admin/dashboard/posts/${postId}/status`,
    updatePostStatusDto,
  );

  return response.data;
};

export const getSharesOfPost = async (
  postId: string,
  getSharesPostQueryDto: GetSharesPostQueryDto,
) => {
  const response = await axios.get(`/admin/dashboard/posts/${postId}/shares`, {
    params: getSharesPostQueryDto,
  });

  return response.data;
};

export const getStoriesDashboard = async (
  getStoriesDashboardQueryDto: GetStoriesDashboardQueryDto,
) => {
  const response = await axios.get(`/admin/dashboard/stories`, {
    params: getStoriesDashboardQueryDto,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};

export const updateStoryStatus = async (
  updateStoryStatusData: UpdateStoryStatusData,
) => {
  const { storyId, updateStoryStatusDto } = updateStoryStatusData;

  const response = await axios.patch(
    `/admin/dashboard/stories/${storyId}/status`,
    updateStoryStatusDto,
  );

  return response.data;
};

export const getReports = async (getReportsQueryDto: GetReportsQueryDto) => {
  const response = await axios.get(`/admin/dashboard/reports`, {
    params: getReportsQueryDto,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};

export const getReportersOfReport = async (
  getReportersOfReportQueryDto: GetReportersOfReportQueryDto,
  targetId: string,
) => {
  const response = await axios.get(
    `/admin/dashboard/reports/${targetId}/reporters`,
    {
      params: getReportersOfReportQueryDto,
      paramsSerializer: {
        indexes: null,
      },
    },
  );

  return response.data;
};

export const updateReportStatus = async (
  updateReportStatusDto: UpdateReportStatusDto,
) => {
  const { reportId, status } = updateReportStatusDto;

  const response = await axios.patch(
    `/admin/dashboard/reports/${reportId}/status`,
    {
      status,
    },
  );

  return response.data;
};
