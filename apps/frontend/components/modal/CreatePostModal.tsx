"use client";
import CreatePostOptions from "@/components/post/CreatePostOptions";
import GlobalIcon from "@/components/ui/icons/global-icon";
import {
  Avatar,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Selection,
  Textarea,
} from "@heroui/react";
import { Lock, Users } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const privacies = [
  { key: "only-me", label: "Only me", icon: <Lock className="w-4 h-4" /> },
  {
    key: "only-friend",
    label: "Only friends",
    icon: <Users className="w-4 h-4" />,
  },
  { key: "public", label: "Public", icon: <GlobalIcon /> },
];

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [selectedKey, setSelectedKey] = useState<Set<string>>(
    new Set(["public"]),
  );

  const [content, setContent] = useState("");

  const handlePost = () => {
    if (!content.trim()) return;
    console.log("Post content:", content);
    setContent("");
  };

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;

    setSelectedKey(new Set(keys as Set<string>));
  };

  useEffect(() => {
    if (selectedKey.size === 0) {
      setSelectedKey(new Set(["public"]));
    }
  }, [selectedKey]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => setIsOpen(!isOpen)}
      backdrop="opaque"
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
              <div className="flex items-center gap-3">
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />

                <div className="flex flex-col gap-1 w-[170px]">
                  <h3 className="text-sm text-gray-900">John Doe</h3>

                  <Select
                    size="sm"
                    defaultSelectedKeys={["public"]}
                    aria-labelledby="privacies"
                    aria-label="privacies"
                    className="text-sm"
                    selectedKeys={selectedKey}
                    onSelectionChange={handleSelectionChange}
                    renderValue={(selected) => {
                      const selectedItem = Array.from(selected)[0];

                      const key = selectedItem.key;

                      const selectedPrivacy = privacies.find(
                        (a) => a.key === key,
                      );

                      if (!selectedPrivacy) return null;

                      return (
                        <div className="flex items-center gap-2 text-sm">
                          {selectedPrivacy.icon}
                          {selectedPrivacy.label}
                        </div>
                      );
                    }}
                  >
                    {privacies.map((animal) => (
                      <SelectItem startContent={animal.icon} key={animal.key}>
                        {animal.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <Textarea
                variant="bordered"
                placeholder="What's on your mind, Doe?"
              />

              <CreatePostOptions />
            </ModalBody>
            <ModalFooter className="flex flex-col">
              <Button color="primary" onPress={handlePost}>
                Post
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreatePostModal;
