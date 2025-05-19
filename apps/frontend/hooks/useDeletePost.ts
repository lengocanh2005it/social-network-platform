import { deletePost } from "@/lib/api/posts";
import { usePostStore } from "@/store";
import { handleAxiosError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useDeletePost = () => {
  const { hidePost } = usePostStore();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (data: any, postId) => {
      if (data && data?.success && data?.message) {
        toast.success(data?.message, {
          position: "bottom-right",
        });

        hidePost(postId);
      }
    },
    onError: (error) => handleAxiosError(error),
  });
};
