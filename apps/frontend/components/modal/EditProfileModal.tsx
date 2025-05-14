"use client";
import EditEducations from "@/components/EditEducations";
import EditWorkPlaces from "@/components/EditWorkPlaces";
import EditDetailsInformationForm from "@/components/form/EditDetailsInformationForm";
import EditSocialsForm from "@/components/form/EditSocialsForm";
import { useAppStore, useUserStore } from "@/store";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
} from "@heroui/react";
import React from "react";

const EditProfileModal: React.FC = () => {
  const tabs = [
    {
      id: "details",
      label: "Details",
      content: <EditDetailsInformationForm />,
    },
    {
      id: "educations",
      label: "Educations",
      content: <EditEducations />,
    },
    {
      id: "work_places",
      label: "Work Places",
      content: <EditWorkPlaces />,
    },
    {
      id: "socials",
      label: "Socials",
      content: <EditSocialsForm />,
    },
  ];

  const {
    isModalEditProfileOpen,
    setIsModalEditProfileOpen,
    setIsDifferentPhoneNumber,
  } = useAppStore();
  const {
    resetUserEducations,
    resetUserWorkPlaces,
    clearEducationsHistory,
    clearWorkPlacesHistory,
  } = useUserStore();

  return (
    <Modal
      backdrop="opaque"
      placement="center"
      shouldBlockScroll={false}
      isKeyboardDismissDisabled={false}
      isDismissable={false}
      size="2xl"
      isOpen={isModalEditProfileOpen}
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
      onOpenChange={() => {
        setIsModalEditProfileOpen(!isModalEditProfileOpen);
        setIsDifferentPhoneNumber(false);
        resetUserEducations();
        resetUserWorkPlaces();
        clearEducationsHistory();
        clearWorkPlacesHistory();
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              Edit Your Profile
            </ModalHeader>
            <ModalBody>
              <div className="flex w-full flex-col">
                <Tabs
                  aria-label="edit-profile-tabs"
                  color="primary"
                  items={tabs}
                  className="w-fit mx-auto shadow-none"
                  radius="full"
                >
                  {(item) => (
                    <Tab
                      key={item.id}
                      title={item.label}
                      className="shadow-none"
                    >
                      <div>{item.content}</div>
                    </Tab>
                  )}
                </Tabs>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
