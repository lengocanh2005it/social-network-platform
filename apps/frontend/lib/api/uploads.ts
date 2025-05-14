import axios from "@/lib/axios";
import { UploadUserImageType } from "@/utils";

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
