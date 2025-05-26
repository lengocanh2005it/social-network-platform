"use client";
import CreatePostHeader from "@/components/post/CreatePostHeader";
import CreatePostOptions from "@/components/post/CreatePostOptions";
import SelectedMedia from "@/components/SelectedMedia";
import { useCreatePost } from "@/hooks";
import { uploadMedia } from "@/lib/api/uploads";
import { useMediaStore, useUserStore } from "@/store";
import {
  CreatePostDto,
  CreatePostImageDto,
  CreatePostVideoDto,
  extractHashtags,
} from "@/utils";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Textarea,
} from "@heroui/react";
import {
  PostContentType,
  PostContentTypeEnum,
  PostPrivaciesEnum,
  PostPrivaciesType,
} from "@repo/db";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [privacy, setPrivacy] = useState<PostPrivaciesType | null>(null);
  const { mediaFiles, clearMediaFiles, clearNewMediaFiles } = useMediaStore();
  const { user } = useUserStore();
  const { mutate: mutateCreatePost, isSuccess, isPending } = useCreatePost();
  const [content, setContent] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);

  useEffect(() => {
    if (!privacy) setPrivacy(PostPrivaciesEnum.public);
  }, [privacy, setPrivacy]);

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
      setContent("");
      clearMediaFiles();
      clearNewMediaFiles();
    }
  }, [isSuccess, setIsOpen, setContent, clearMediaFiles, clearNewMediaFiles]);

  const handlePost = async () => {
    if (!privacy) return;

    let hashtags: string[] = [];

    if (content.trim() !== "") hashtags = extractHashtags(content);

    let images: CreatePostImageDto[] = [];

    let videos: CreatePostVideoDto[] = [];

    if (mediaFiles?.length) {
      try {
        setIsUploadingMedia(true);

        const response = await uploadMedia(mediaFiles.map((mf) => mf.file));

        if (response && response?.media) {
          images = response.media
            .filter((rm) => rm.type === "image")
            .map((rm) => ({
              image_url: rm.fileUrl,
            })) as CreatePostImageDto[];

          videos = response.media
            .filter((rm) => rm.type === "video")
            .map((rm) => ({
              video_url: rm.fileUrl,
            })) as CreatePostVideoDto[];
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploadingMedia(false);
      }
    }

    let textBlocks: { type: PostContentType; content: string }[] = [];

    if (content.trim() !== "") {
      const regex = /#([\p{L}\p{N}_]+)/gu;

      const linesArr = content
        .split("\n")
        .map((line) => line.replace(regex, "").trim())
        .filter((line) => line !== "");

      if (linesArr.length > 0) {
        const formattedContent = linesArr.length > 1 ? linesArr : linesArr[0];

        textBlocks =
          typeof formattedContent === "string"
            ? [{ type: PostContentTypeEnum.text, content: formattedContent }]
            : formattedContent.map((line) => ({
                type: PostContentTypeEnum.text,
                content: line,
              }));
      }
    }

    const createPostDto: CreatePostDto = {
      privacy,
      ...(hashtags?.length !== 0 && { hashtags }),
      ...(images?.length !== 0 && { images }),
      ...(videos?.length !== 0 && { videos }),
      ...(textBlocks?.length !== 0 && { contents: textBlocks }),
    };

    mutateCreatePost(createPostDto);
  };

  return (
    <>
      {user && (
        <>
          <Modal
            isOpen={isOpen}
            onOpenChange={() => {
              setIsOpen(!isOpen);
              setTimeout(() => {
                setContent("");
                clearMediaFiles();
                clearNewMediaFiles();
              }, 1000);
            }}
            backdrop="opaque"
            placement="center"
            isDismissable={false}
            isKeyboardDismissDisabled={false}
            shouldBlockScroll={false}
            size="lg"
            motionProps={{
              variants: {
                enter: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                },
                exit: {
                  y: -20,
                  opacity: 0,
                  transition: {
                    duration: 0.2,
                    ease: "easeIn",
                  },
                },
              },
            }}
          >
            <ModalContent>
              {() => (
                <>
                  <ModalHeader className="text-xl font-semibold text-center flex flex-col">
                    Create post
                  </ModalHeader>

                  <Divider />

                  <ModalBody>
                    <CreatePostHeader
                      privacy={PostPrivaciesEnum.public}
                      onChange={(key) => setPrivacy(key)}
                    />

                    <Textarea
                      variant="bordered"
                      placeholder={`What's on your mind, ${user.profile.last_name}?`}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
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
                  <ModalFooter className="flex flex-col">
                    {!isPending && !isUploadingMedia ? (
                      <Button
                        color="primary"
                        onPress={handlePost}
                        isDisabled={
                          !(content.trim() !== "" || mediaFiles?.length !== 0)
                        }
                      >
                        Post
                      </Button>
                    ) : (
                      <Button color="primary" isLoading>
                        Please wait...
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
};

export default CreatePostModal;
