"use client";
import { useMediaStore } from "@/store";
import { Tooltip } from "@heroui/react";
import { ImageIcon } from "lucide-react";
import React, { useRef } from "react";

export default function UploadMediaButton() {
  const { addMediaFiles } = useMediaStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      addMediaFiles(filesArray);
    }

    e.target.value = "";
  };

  return (
    <>
      <Tooltip content="Photo/video">
        <ImageIcon
          className="focus:outline-none cursor-pointer"
          onClick={handleClick}
        />
      </Tooltip>

      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
