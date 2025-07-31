"use client";
import AdminProfileModalBody from "@/components/AdminProfileModalBody";
import { useSignOut } from "@/hooks";
import { useUserStore } from "@/store";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
  useDisclosure,
  User,
} from "@heroui/react";
import { LogOut } from "lucide-react";

export default function AdminProfileModal() {
  const { user } = useUserStore();
  const { mutate: mutateSignOut, isPending } = useSignOut();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSignOut = () => {
    if (user?.id) mutateSignOut(user.id);
  };

  return (
    <>
      <div
        className="flex items-center gap-3 justify-between rounded-lg dark:hover:bg-white/10
      px-4 py-2"
      >
        {!user ? (
          <>
            <div className="w-full flex items-center gap-3">
              <div>
                <Skeleton className="flex rounded-full w-12 h-12" />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </div>
          </>
        ) : (
          <>
            <User
              avatarProps={{
                src: user?.profile?.avatar_url ?? "",
              }}
              description="Admin/Manager"
              name={user?.profile?.first_name + " " + user?.profile?.last_name}
              className="cursor-pointer select-none"
              onClick={onOpen}
            />

            <LogOut
              className={`dark:text-white text-black cursor-pointer opacity-80 hover:opacity-100
        duration-300 ease-in-out focus:outline-none 
        ${isPending && "select-none opacity-60 pointer-events-none"}`}
              onClick={handleSignOut}
            />
          </>
        )}
      </div>

      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        placement="center"
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
        onOpenChange={onOpenChange}
        size="lg"
        isDismissable={false}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Your Profile
              </ModalHeader>
              <ModalBody className="dark:text-white text-black">
                <AdminProfileModalBody onClose={onOpenChange} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
