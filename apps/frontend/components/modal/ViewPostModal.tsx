"use client";
import CommentItem, { CommentType } from "@/components/post/CommentItem";
import PostContent from "@/components/post/PostContent";
import PostHeader from "@/components/post/PostHeader";
import PostOptions from "@/components/post/PostOptions";
import { useUserStore } from "@/store";
import { Post } from "@/utils";
import {
  Avatar,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
} from "@heroui/react";
import {
  Camera,
  SendHorizontal,
  SmileIcon,
  Star,
  Sticker,
  WandSparkles,
} from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

interface ViewPostModalProps {
  homePost: Post;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const icons = [
  {
    key: 1,
    icon: <Star className="w-5 h-5" />,
    label: "",
  },
  {
    key: 2,
    icon: <SmileIcon className="w-5 h-5" />,
    label: "",
  },
  {
    key: 3,
    icon: <Camera className="w-5 h-5" />,
    label: "",
  },
  {
    key: 4,
    icon: <WandSparkles className="w-5 h-5" />,
    label: "",
  },
  {
    key: 5,
    icon: <Sticker className="w-5 h-5" />,
    label: "",
  },
];

const comments: CommentType[] = [
  {
    id: "1",
    author: "Alice",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    content: "Nice post!",
    time: "2h ago",
    replies: [
      {
        id: "2",
        author: "Bob",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        content: "Thanks Alice!",
        time: "1h ago",
        replies: [
          {
            id: "3",
            author: "Charlie",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            content: "Agree with Bob",
            time: "30m ago",
          },
        ],
      },
    ],
  },
];

const ViewPostModal: React.FC<ViewPostModalProps> = ({
  homePost,
  isOpen,
  setIsOpen,
}) => {
  const { user } = useUserStore();

  return (
    <>
      {user && (
        <>
          <Modal
            backdrop="opaque"
            isOpen={isOpen}
            size="2xl"
            placement="center"
            shouldBlockScroll={false}
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
            onOpenChange={() => setIsOpen(!isOpen)}
          >
            <ModalContent className="md:py-3 py-2">
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-1 text-center">
                    John Doe&apos;s Post
                  </ModalHeader>

                  <Divider />

                  <ModalBody className="px-3">
                    <ScrollShadow
                      className="max-h-[500px] pr-1 max-w-full overflow-x-hidden"
                      offset={0}
                      size={0}
                    >
                      <div className="flex flex-col">
                        <PostHeader
                          homePost={homePost}
                          shouldHiddenXCloseIcon
                        />
                        <PostContent homePost={homePost} />
                        <PostOptions />
                      </div>

                      <Divider />

                      <div className="mt-6">
                        {comments.map((comment) => (
                          <CommentItem key={comment.id} comment={comment} />
                        ))}
                      </div>
                    </ScrollShadow>

                    <div className="flex md:gap-3 gap-2">
                      <Avatar
                        src={user.profile.avatar_url}
                        className="rounded-full w-10 h-10 select-none"
                      />

                      <div className="w-full bg-gray-100 rounded-xl p-3">
                        <textarea
                          rows={1}
                          placeholder="Write a comment..."
                          className="w-full bg-transparent resize-none focus:outline-none text-sm"
                        />

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-2">
                            {icons.map((icon) => (
                              <button
                                className="text-gray-500 hover:text-gray-700 transition-all"
                                key={icon.key}
                              >
                                {icon.icon}
                              </button>
                            ))}
                          </div>

                          <button className="text-gray-500 hover:text-gray-700">
                            <SendHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
};

export default ViewPostModal;
