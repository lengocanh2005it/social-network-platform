import { updatePost } from "@/lib/api/posts";
import { useMediaStore, usePostStore, useUserStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useUpdatePost = () => {
  const { updatePost: updatePostStore } = usePostStore();
  const { clearDeletedMediaFiles, clearMediaFiles, clearNewMediaFiles } =
    useMediaStore();
  const {
    setOriginalTaggedUsers,
    setSelectedTaggedUsers,
    setTempSelectedTaggedUsers,
  } = useUserStore();

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
        setOriginalTaggedUsers([]);
        setSelectedTaggedUsers([]);
        setTempSelectedTaggedUsers([]);
      }
    },
    onError: (error) => handleAxiosError(error),
  });
};
