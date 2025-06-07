"use client";
import { useCreateStory } from "@/hooks";
import { uploadMedia } from "@/lib/api/uploads";
import { useStoryStore } from "@/store";
import { CreateStoryDto, Story } from "@/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { ContentStoryTypeEnum } from "@repo/db";
import { Camera } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface CreateStoryModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const { mutate: mutateCreateStory, isPending } = useCreateStory();
  const { addNewStory } = useStoryStore();
  const [hasUploadImage, setHasUploadImage] = useState<boolean>(false);

  const handleSubmit = async () => {
    let content_url: string | null = "";

    if (image) {
      setHasUploadImage(true);

      try {
        const response = await uploadMedia([image]);

        if (response && response?.media[0]?.fileUrl) {
          content_url = response?.media[0]?.fileUrl;
        }
      } finally {
        setHasUploadImage(false);
      }
    }

    const createStoryDto: CreateStoryDto = {
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      content_type: image
        ? ContentStoryTypeEnum.image
        : ContentStoryTypeEnum.text,
      ...(content?.trim() && { text_content: content.trim() }),
      ...(content_url?.trim() && { content_url }),
    };

    mutateCreateStory(createStoryDto, {
      onSuccess: (data: Story) => {
        if (data) {
          addNewStory(data);
          toast.success("Your story has been shared.", {
            position: "bottom-right",
          });
        }
        setIsOpen(false);
        setContent("");
        setImage(null);
      },
    });
  };

  return (
    <Modal
      backdrop="opaque"
      shouldBlockScroll={false}
      isDismissable={false}
      size="md"
      isKeyboardDismissDisabled={true}
      placement="center"
      isOpen={isOpen}
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
      onOpenChange={() => {
        setIsOpen(!isOpen);
        setImage(null);
        setContent("");
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Create new story
            </ModalHeader>
            <ModalBody className="flex flex-col gap-3 items-center justify-center">
              <p className="text-center text-sm italic">
                You are only allowed to post up to 5 stories per day, and each
                story expires after 24 hours.
              </p>

              {!image && (
                <Textarea
                  placeholder="Tell us about your story..."
                  value={content}
                  variant="bordered"
                  onChange={(e) => setContent(e.target.value)}
                />
              )}

              <label className="w-fit cursor-pointer flex items-center gap-2 text-primary">
                <Camera
                  className="w-6 h-6 focus:outline-none opacity-70 hover:opacity-100
                duration-250 ease-in-out transition-all cursor-pointer"
                />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                />
              </label>

              {image && (
                <PhotoProvider>
                  <div className="relative w-full">
                    <PhotoView src={URL.createObjectURL(image)}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-full rounded-lg object-cover aspect-video
                        select-none cursor-pointer"
                      />
                    </PhotoView>

                    <button
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50
                       text-white rounded-full w-6 h-6 flex items-center justify-center 
                       text-sm hover:bg-opacity-75 transition cursor-pointer"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                </PhotoProvider>
              )}
            </ModalBody>
            <ModalFooter className="flex flex-col">
              {isPending || hasUploadImage ? (
                <Button color="primary" isLoading>
                  Please wait...
                </Button>
              ) : (
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isDisabled={!(content?.trim() || image)}
                >
                  Create Story
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateStoryModal;
