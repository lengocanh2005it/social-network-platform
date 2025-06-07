import axios from "@/lib/axios";
import {
  CreateStoryDto,
  GetStoryQueryDto,
  GetStoryViewersQueryDto,
} from "@/utils";

export const createStory = async (createStoryDto: CreateStoryDto) => {
  const response = await axios.post(`/stories`, createStoryDto);

  return response.data;
};

export const getStories = async (getStoryQueryDto?: GetStoryQueryDto) => {
  const response = await axios.get(`/stories`, {
    params: getStoryQueryDto,
  });

  return response.data;
};

export const getViewersOfStory = async (
  storyId: string,
  getStoryViewersQueryDto?: GetStoryViewersQueryDto,
) => {
  const response = await axios.get(`/stories/${storyId}/viewers`, {
    params: getStoryViewersQueryDto,
  });

  return response.data;
};

export const deleteStory = async (storyId: string) => {
  const response = await axios.delete(`/stories/${storyId}`);

  return response.data;
};
