import axios from "@/lib/axios";
import { MediaUploadResponseType, UploadUserImageType } from "@/utils";

export const uploadUserImage = async (
  uploadUserImageDto: UploadUserImageType,
) => {
  const { type, file } = uploadUserImageDto;

  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post("/uploads/user", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      type,
    },
    withCredentials: true,
  });

  return response.data;
};

export const uploadMedia = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await axios.post<MediaUploadResponseType>(
    "/uploads/media",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
