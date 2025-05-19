"use client";
import CreatePostHeader from "@/components/post/CreatePostHeader";
import CreatePostOptions from "@/components/post/CreatePostOptions";
import SelectedMedia from "@/components/SelectedMedia";
import { useMediaStore } from "@/store";
import { Post } from "@/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Textarea,
} from "@heroui/react";
import { PostPrivaciesType } from "@repo/db";
import React, { useEffect, useState } from "react";

interface UpdatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onUpdate: (data: {
    content: string;
    images: File[];
    videos: File[];
    privacy: PostPrivaciesType;
  }) => Promise<void>;
}

const UpdatePostModal: React.FC<UpdatePostModalProps> = ({
  open,
  onOpenChange,
  post,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mediaFiles, addMediaFromUrl, newMediaFiles } = useMediaStore();
  const [content, setContent] = useState<string>("");
  const [newPrivacy, setNewPrivacy] = useState<PostPrivaciesType | null>(null);

  useEffect(() => {
    if (!open || !post) return;

    const handleAddFile = async () => {
      if (post.images?.length) {
        await Promise.all(
          post.images.map((image) => addMediaFromUrl(image.image_url, "image")),
        );
      }

      if (post.videos?.length) {
        await Promise.all(
          post.videos.map((video) => addMediaFromUrl(video.video_url, "video")),
        );
      }
    };

    handleAddFile();

    const hashtags = post.hashtags.map((ht) => `#${ht.hashtag}`);

    setContent(
      post.contents.map((c) => c.content).join("\n") +
        (hashtags.length > 0 ? "\n\n" + hashtags.join(" ") : ""),
    );
  }, [open, post, addMediaFromUrl]);

  useEffect(() => {
    setNewPrivacy(post.privacy);
  }, [setNewPrivacy, post]);

  const handleSubmit = async () => {
    if (!newPrivacy) return;

    setIsLoading(true);

    try {
      await onUpdate({
        content,
        images: newMediaFiles
          .filter((mf) => mf.type === "image")
          .map((mf) => mf.file),
        videos: newMediaFiles
          .filter((mf) => mf.type === "video")
          .map((mf) => mf.file),
        privacy: newPrivacy,
      });
    } finally {
      onOpenChange(false);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      backdrop="opaque"
      placement="center"
      isKeyboardDismissDisabled={false}
      isDismissable={false}
      size="lg"
      isOpen={open}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" },
          },
        },
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-center text-xl flex flex-col">
              Update post
            </ModalHeader>

            <ModalBody className="flex flex-col md:gap-2 gap-1">
              <CreatePostHeader
                privacy={post.privacy}
                onChange={(key) => setNewPrivacy(key)}
              />

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                variant="bordered"
                placeholder="Update your post..."
              />

              {mediaFiles?.length !== 0 && (
                <ScrollShadow
                  className="max-h-[150px]"
                  offset={0}
                  size={0}
                  hideScrollBar
                >
                  <SelectedMedia />
                </ScrollShadow>
              )}

              <CreatePostOptions />
            </ModalBody>

            <ModalFooter className="flex items-center justify-center">
              <Button color="primary" onPress={onClose}>
                Cancel
              </Button>

              {(content.trim() !== "" || mediaFiles?.length > 0) && (
                <>
                  {isLoading ? (
                    <Button color="primary" isLoading>
                      Please wait...
                    </Button>
                  ) : (
                    <Button color="primary" onPress={handleSubmit}>
                      Update
                    </Button>
                  )}
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdatePostModal;
