"use client";
import { useMediaStore } from "@/store";
import { Tooltip } from "@heroui/react";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface MediaWithUrl {
  file: File;
  type: "image" | "video";
  url: string;
}

export default function SelectedMedia() {
  const { mediaFiles, removeMediaFile } = useMediaStore();
  const [mediaWithUrls, setMediaWithUrls] = useState<MediaWithUrl[]>([]);

  const handleRemove = (index: number) => {
    removeMediaFile(index);
  };

  useEffect(() => {
    const newMediaWithUrls = mediaFiles.map(({ file, type }) => ({
      file,
      type,
      url: URL.createObjectURL(file),
    }));

    mediaWithUrls.forEach((media) => URL.revokeObjectURL(media.url));

    setMediaWithUrls(newMediaWithUrls);
  }, [mediaFiles, mediaWithUrls]);

  return (
    <PhotoProvider>
      <div className="flex flex-wrap gap-3 p-2 flex-1">
        {mediaWithUrls.map(({ type, url }, index) => (
          <div
            key={url}
            className="relative w-24 h-24 rounded overflow-hidden border border-black/10"
          >
            {type === "image" ? (
              <PhotoView src={url}>
                <img
                  src={url}
                  alt={`selected-${index}`}
                  className="object-cover w-full h-full cursor-zoom-in select-none"
                />
              </PhotoView>
            ) : (
              <video
                src={url}
                controls
                className="object-cover w-full h-full select-none"
              />
            )}

            <Tooltip content="Delete">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white 
                  rounded-full p-1 hover:bg-opacity-75 cursor-pointer"
              >
                <XIcon size={16} />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
    </PhotoProvider>
  );
}
