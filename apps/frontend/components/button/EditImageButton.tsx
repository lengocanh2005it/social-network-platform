"use client";
import { uploadUserImage } from "@/lib/api/uploads";
import { getMe } from "@/lib/api/users";
import { useUserStore } from "@/store";
import { UploadUserImageType, UploadUserImageTypeEnum } from "@/utils";
import getCroppedImg, { handleAxiosError } from "@/utils/helpers";
import { Button, Modal, ModalBody, ModalContent, Tooltip } from "@heroui/react";
import { CameraIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { toast } from "react-hot-toast";

export default function EditImageButton({
  type,
  classNames,
}: {
  type: "avatar" | "cover_photo";
  classNames?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaing, setIsLoading] = useState<boolean>(false);
  const { setUser, user } = useUserStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setOriginalFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result as string);
      setModalOpen(true);
    };

    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

    const fileName = originalFile?.name || "avatar.jpg";

    const file = new File([croppedBlob], fileName, {
      type: croppedBlob.type,
      lastModified: Date.now(),
    });

    const uploadUserImageDto: UploadUserImageType = {
      type:
        type === "avatar"
          ? UploadUserImageTypeEnum.AVATAR
          : UploadUserImageTypeEnum.COVER_PHOTO,
      file,
    };

    setIsLoading(true);

    try {
      const response = await uploadUserImage(uploadUserImageDto);

      if (response && response?.success === true && response?.message) {
        toast.success(response.message, {
          position: "bottom-right",
        });

        if (user?.profile) {
          const res = await getMe({
            includeProfile: true,
            includeEducations: true,
            includeWorkPlaces: true,
            includeSocials: true,
            username: user.profile.username,
          });

          if (res) setUser(res);
        }
      }
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setModalOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      {type === "avatar" ? (
        <Tooltip content="Edit avatar">
          <Button
            isIconOnly
            onPress={() => fileInputRef.current?.click()}
            className={`absolute bottom-3 right-3 bg-gray-400 dark:bg-black/70 text-white 
          p-2 rounded-full hover:bg-gray-500 dark:hover:bg-black transition dark:border dark:border-white/20 ${classNames}`}
          >
            <CameraIcon />
          </Button>
        </Tooltip>
      ) : (
        <Button
          startContent={<CameraIcon />}
          onPress={() => fileInputRef.current?.click()}
          className="absolute bottom-4 right-4 bg-white
         text-black px-3 py-1 rounded-md flex items-center gap-1 transition"
        >
          Edit cover photo
        </Button>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <Modal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        size="full"
        isKeyboardDismissDisabled={false}
        isDismissable={false}
        placement="center"
      >
        <ModalContent>
          <ModalBody className="relative w-full h-[80vh] bg-black/90">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={type === "avatar" ? 1 : 3 / 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}

            <div className="absolute bottom-5 right-5 z-10 flex gap-3">
              <Button onPress={() => setModalOpen(false)} color="secondary">
                Cancel
              </Button>

              <Button
                onPress={handleUpload}
                isDisabled={isLoaing}
                isLoading={isLoaing}
                color="secondary"
              >
                {isLoaing ? "Please wait..." : "Save"}
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
