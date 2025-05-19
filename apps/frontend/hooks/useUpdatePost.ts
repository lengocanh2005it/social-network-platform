import { updatePost } from "@/lib/api/posts";
import { useMediaStore, usePostStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useUpdatePost = () => {
  const { updatePost: updatePostStore } = usePostStore();
  const { clearDeletedMediaFiles, clearMediaFiles, clearNewMediaFiles } =
    useMediaStore();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (data: any, variables) => {
      if (data) {
        updatePostStore(variables.postId, data);
        toast.success("Post updated successfully!", {
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
