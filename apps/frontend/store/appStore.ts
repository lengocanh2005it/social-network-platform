import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  isModalOTPOpen: boolean;
  setIsModalOTPOpen: (isModalOTPOpen: boolean) => void;
  isPasswordResetSuccess: boolean;
  setIsPasswordResetSuccess: (isPasswordResetSuccess: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isModalOTPOpen: false,
      setIsModalOTPOpen: (isModalOTPOpen) => set({ isModalOTPOpen }),
      isPasswordResetSuccess: false,
      setIsPasswordResetSuccess: (isPasswordResetSuccess) =>
        set({ isPasswordResetSuccess }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({}),
    }
  )
);
