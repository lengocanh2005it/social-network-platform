import axios from "axios";
import { create } from "zustand";

type MediaType = "image" | "video";

export interface MediaFile {
  file: File;
  type: MediaType;
  source: "new" | "existing";
  url?: string;
}

export interface DeleteMediaFile {
  url: string;
  type: MediaType;
}

interface MediaState {
  mediaFiles: MediaFile[];
  newMediaFiles: MediaFile[];
  deletedMediaFiles: DeleteMediaFile[];
  setMediaFiles: (mediaFiles: MediaFile[]) => void;
  addMediaFiles: (files: File[]) => void;
  clearMediaFiles: () => void;
  removeMediaFile: (index: number) => void;
  addMediaFromUrl: (url: string, type: MediaType) => Promise<void>;
  clearDeletedMediaFiles: () => void;
  clearNewMediaFiles: () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaFiles: [],
  deletedMediaFiles: [],
  newMediaFiles: [],
  setMediaFiles: (mediaFiles) => set({ mediaFiles }),
  addMediaFiles: (files) => {
    const newMedia = files.map((file) => {
      const type: MediaType = file.type.startsWith("video/")
        ? "video"
        : "image";
      return { file, type, source: "new" as const };
    });

    set((state) => ({
      mediaFiles: [...state.mediaFiles, ...newMedia],
      newMediaFiles: [...state.newMediaFiles, ...newMedia],
    }));
  },
  clearMediaFiles: () => set({ mediaFiles: [] }),
  clearDeletedMediaFiles: () => set({ deletedMediaFiles: [] }),
  clearNewMediaFiles: () => set({ newMediaFiles: [] }),
  removeMediaFile: (index) => {
    set((state) => {
      const mediaToRemove = state.mediaFiles[index];

      const updatedMediaFiles = state.mediaFiles.filter((_, i) => i !== index);

      const updatedNewMediaFiles =
        mediaToRemove.source === "new"
          ? state.newMediaFiles.filter((_, i) => i !== index)
          : state.newMediaFiles;

      const updatedDeletedMedia =
        mediaToRemove.source === "existing" && mediaToRemove.url
          ? [
              ...state.deletedMediaFiles,
              {
                url: mediaToRemove.url,
                type: mediaToRemove.type,
              },
            ]
          : state.deletedMediaFiles;

      return {
        mediaFiles: updatedMediaFiles,
        newMediaFiles: updatedNewMediaFiles,
        deletedMediaFiles: updatedDeletedMedia,
      };
    });
  },
  addMediaFromUrl: async (url, type) => {
    const response = await axios.get(url, {
      responseType: "blob",
    });

    const blob = response.data;
    const filename = url.split("/").pop() || "downloaded-file";
    const file = new File([blob], filename, { type: blob.type });

    const newMedia: MediaFile = {
      file,
      type,
      source: "existing",
      url,
    };

    set((state) => {
      const exists = state.mediaFiles.some(
        (media) => media.source === "existing" && media.url === url,
      );

      if (exists) return state;

      return {
        mediaFiles: [...state.mediaFiles, newMedia],
      };
    });
  },
}));
