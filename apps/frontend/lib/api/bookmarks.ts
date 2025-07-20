import axios from "@/lib/axios";
import {
  CreateBookMarkDto,
  DeleteBookMarksQueryDto,
  GetBookMarksQueryDto,
} from "@/utils";
import qs from "qs";

export const createBookmark = async (createBookMarkDto: CreateBookMarkDto) => {
  const response = await axios.post("/bookmarks", createBookMarkDto);

  return response.data;
};

export const getBookMarks = async (
  getBookMarksQueryDto: GetBookMarksQueryDto,
) => {
  const response = await axios.get("/bookmarks", {
    params: getBookMarksQueryDto,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};

export const deleteBookMarks = async (
  deleteBookMarksQueryDto: DeleteBookMarksQueryDto,
) => {
  const response = await axios.delete("/bookmarks", {
    params: deleteBookMarksQueryDto,
    paramsSerializer: {
      serialize: (params) => {
        return qs.stringify(params, {
          arrayFormat: "comma",
        });
      },
    },
  });

  return response.data;
};
