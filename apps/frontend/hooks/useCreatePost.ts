import { createPost } from "@/lib/api/posts";
import { useMediaStore, usePostStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useCreatePost = () => {
  const { addNewPost } = usePostStore();
  const { clearDeletedMediaFiles, clearMediaFiles, clearNewMediaFiles } =
    useMediaStore();

  return useMutation({
    mutationFn: createPost,
    onSuccess: async (data: any) => {
      if (data) {
        addNewPost(data);
        toast.success("New post added successfully!", {
          position: "bottom-right",
        });
        clearDeletedMediaFiles();
        clearMediaFiles();
        clearNewMediaFiles();
      }
    },
    onError: (error) => handleAxiosError(error),
  });
};
