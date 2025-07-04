import { uploadUserImage } from "@/lib/api/uploads";
import { handleAxiosError, UploadUserImageType } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (uploadUserImageDto: UploadUserImageType) =>
      uploadUserImage(uploadUserImageDto),
    onError: (error: any) => handleAxiosError(error),
  });
};
