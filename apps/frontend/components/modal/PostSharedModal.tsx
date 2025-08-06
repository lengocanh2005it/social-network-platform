"use client";
import { useCreatePostShare } from "@/hooks";
import { PostDetails, usePostStore, useUserStore } from "@/store";
import { CreatePostShare, extractHashtags, formatDateTime } from "@/utils";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Select,
  Selection,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  PostContentType,
  PostContentTypeEnum,
  PostPrivaciesEnum,
  PostPrivaciesType,
} from "@repo/db";
import { Share2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface PostShareModalProps {
  post: PostDetails;
}

const PostSharedModal: React.FC<PostShareModalProps> = ({ post }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { user, viewedUser } = useUserStore();
  const [content, setContent] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<Set<PostPrivaciesType>>(
    new Set([PostPrivaciesEnum.public]),
  );
  const { mutate: mutateCreatePostShare, isPending } = useCreatePostShare();
  const { addNewPost } = usePostStore();

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;

    const newKeySet = new Set(keys as Set<PostPrivaciesType>);

    setSelectedKey(newKeySet);
  };

  const handleCreatePostShare = async () => {
    if (!content || content?.trim() === "" || selectedKey.size === 0) return;

    const actualValue = Array.from(selectedKey)[0];

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

    let hashtags: string[] = [];

    if (content.trim() !== "") hashtags = extractHashtags(content);

    const createPostShareDto: CreatePostShare = {
      privacy: actualValue,
      post_id: post.id,
      contents: textBlocks,
      ...(hashtags?.length !== 0 && { hashtags }),
    };

    mutateCreatePostShare(createPostShareDto, {
      onSuccess: (data: PostDetails) => {
        if (data) {
          if (viewedUser?.id === user?.id) addNewPost(data);
          setContent("");
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast.success("Post shared successfully.", {
            position: "bottom-right",
          });
          onClose();
        }
      },
    });
  };

  return (
    <>
      <div
        className="flex justify-center cursor-pointer items-center gap-2 
      p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/20 
      transition-all duration-250 ease-in select-none"
        onClick={onOpen}
      >
        <Share2 size={20} />
        <p className="text-md">Share</p>
      </div>

      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        placement="center"
        size="2xl"
        isDismissable={false}
        shouldBlockScroll={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={onOpenChange}
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
      >
        <ModalContent className="rounded-xl">
          {(onClose) => (
            <>
              <ModalHeader className="text-lg font-semibold flex flex-col text-center">
                Share this post
              </ModalHeader>

              <ModalBody>
                <ScrollShadow
                  offset={0}
                  size={0}
                  className="md:max-h-[500px] max-h-[400px] pr-2"
                >
                  <div className="flex flex-col md:gap-3 gap-2">
                    <div
                      className="flex flex-col gap-3 items-start border
                    dark:border-white/20 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between w-full md:gap-3 gap-4">
                        <div className="flex items-start md:gap-3 gap-2">
                          <Avatar
                            src={post.user.profile.avatar_url}
                            alt="User"
                            className="select-none"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white/80">
                              {post.user.profile.first_name +
                                " " +
                                post.user.profile.last_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-white/70 mb-1">
                              {formatDateTime(post.created_at)}
                            </p>
                            {(post?.contents?.length !== 0 ||
                              post?.hashtags?.length !== 0) && (
                              <section className="flex flex-col md:gap-2 gap-1 relative">
                                {post?.contents?.length !== 0 && (
                                  <div
                                    className="flex flex-col relative md:gap-2 gap-1 
                                  text-black/80 dark:text-white/80"
                                  >
                                    {post.contents.map((ct) => (
                                      <p
                                        className="text-sm whitespace-pre-wrap"
                                        key={ct.id}
                                      >
                                        {ct.content}
                                      </p>
                                    ))}
                                  </div>
                                )}

                                {post?.hashtags?.length !== 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {post.hashtags.map((tag) => (
                                      <span
                                        key={tag.id}
                                        className="text-xs cursor-pointer text-blue-500 bg-blue-100 
                          px-2 py-0.5 rounded-full"
                                      >
                                        #{tag.hashtag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </section>
                            )}
                          </div>
                        </div>

                        <Select
                          variant="bordered"
                          className="w-[150px]"
                          defaultSelectedKeys={["public"]}
                          isRequired
                          aria-labelledby="privacies"
                          aria-label="privacies"
                          selectedKeys={selectedKey ?? []}
                          onSelectionChange={handleSelectionChange}
                        >
                          <SelectItem key={PostPrivaciesEnum.public}>
                            Public
                          </SelectItem>
                          <SelectItem key={PostPrivaciesEnum.only_friend}>
                            Friends
                          </SelectItem>
                          <SelectItem key={PostPrivaciesEnum.only_me}>
                            Only me
                          </SelectItem>
                        </Select>
                      </div>

                      {post?.images?.length > 0 && (
                        <div
                          className={`grid gap-2 w-full ${
                            post.images.length === 1
                              ? "grid-cols-1"
                              : post.images.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2"
                          }`}
                        >
                          {post.images.slice(0, 4).map((src, index) => (
                            <div key={src.id} className="relative">
                              <img
                                src={src.image_url}
                                alt={`post-image-${index}`}
                                className="w-full h-32 rounded-md select-none"
                              />

                              {index === 3 && post.images.length > 4 && (
                                <div
                                  className="absolute inset-0 bg-black/10 bg-opacity-50 
                                  rounded-md flex items-center justify-center text-white 
                                  font-semibold text-lg"
                                >
                                  +{post.images.length - 4} more
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Textarea
                      placeholder="Say something about this post..."
                      variant="bordered"
                      onChange={(e) => setContent(e.target.value)}
                      value={content}
                    />
                  </div>
                </ScrollShadow>
              </ModalBody>

              <ModalFooter className="flex items-center justify-center gap-2">
                <Button color="primary" onPress={onClose}>
                  Cancel
                </Button>

                {content?.trim() !== "" && selectedKey.size > 0 && (
                  <>
                    {isPending ? (
                      <Button color="primary" isLoading>
                        Please wait...
                      </Button>
                    ) : (
                      <Button color="primary" onPress={handleCreatePostShare}>
                        Share
                      </Button>
                    )}
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PostSharedModal;
