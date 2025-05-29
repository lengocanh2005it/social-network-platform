import {
  AuthMethod,
  OAuthNames,
  Provider,
  RelationshipType,
  Tokens,
} from "@/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  isModalOTPOpen: boolean;
  setIsModalOTPOpen: (isModalOTPOpen: boolean) => void;
  isPasswordResetSuccess: boolean;
  setIsPasswordResetSuccess: (isPasswordResetSuccess: boolean) => void;
  authMethod: AuthMethod | null;
  setAuthMethod: (authMethod: AuthMethod | null) => void;
  oAuthNames: OAuthNames | null;
  setOAuthNames: (oAuthNames: OAuthNames) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  oAuthTokens: Tokens | null;
  setOAuthTokens: (oAuthTokens: Tokens) => void;
  provider: Provider | null;
  setProvider: (provider: Provider) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  isModalEditProfileOpen: boolean;
  setIsModalEditProfileOpen: (isModlaEditProfileOpen: boolean) => void;
  isDifferentPhoneNumber: boolean;
  setIsDifferentPhoneNumber: (isDifferentPhoneNumber: boolean) => void;
  is2FAEnabled: boolean;
  setIs2FAEnabled: (is2FAEnabled: boolean) => void;
  is2FAModalOpen: boolean;
  setIs2FAModalOpen: (is2FAModalOpen: boolean) => void;
  method: "email" | "phone_number" | null;
  setMethod: (method: "email" | "phone_number" | null) => void;
  isVerifiedFor2FA: boolean;
  setIsVerifiedFor2FA: (isVerifiedFor2FA: boolean) => void;
  otp2FaVerified: string;
  setOtp2FaVerified: (otp2FaVerified: string) => void;
  accountOwnershipOtp: string;
  setAccountOwnershipOtp: (accountOwnershipDto: string) => void;
  qrCodeDataUrl: string;
  setQrCodeDataUrl: (qrCodeDataUrl: string) => void;
  isDisable2FaClick: boolean;
  setIsDisable2FaClick: (isDisable2Fa: boolean) => void;
  isConfirmDisable2Fa: boolean;
  setIsConfirmDisable2Fa: (isConfirmDisable2Fa: boolean) => void;
  cloudfareToken: string | null;
  setCloudfareToken: (cloudfareToken: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isModalOTPOpen: false,
      setIsModalOTPOpen: (isModalOTPOpen) => set({ isModalOTPOpen }),
      isPasswordResetSuccess: false,
      setIsPasswordResetSuccess: (isPasswordResetSuccess) =>
        set({ isPasswordResetSuccess }),
      authMethod: null,
      setAuthMethod: (authMethod) => set({ authMethod }),
      oAuthNames: null,
      setOAuthNames: (oAuthNames) => set({ oAuthNames }),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      oAuthTokens: null,
      setOAuthTokens: (oAuthTokens) => set({ oAuthTokens }),
      provider: null,
      setProvider: (provider) => set({ provider }),
      isLoggedIn: false,
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      isModalEditProfileOpen: false,
      setIsModalEditProfileOpen: (isModalEditProfileOpen) =>
        set({ isModalEditProfileOpen }),
      isDifferentPhoneNumber: false,
      setIsDifferentPhoneNumber: (isDifferentPhoneNumber) =>
        set({
          isDifferentPhoneNumber,
        }),
      is2FAEnabled: false,
      setIs2FAEnabled: (is2FAEnabled) => set({ is2FAEnabled }),
      is2FAModalOpen: false,
      setIs2FAModalOpen: (is2FAModalOpen) => set({ is2FAModalOpen }),
      method: null,
      setMethod: (method) => set({ method }),
      isVerifiedFor2FA: false,
      setIsVerifiedFor2FA: (isVerifiedFor2FA) => set({ isVerifiedFor2FA }),
      otp2FaVerified: "",
      setOtp2FaVerified: (otp2FaVerified) => set({ otp2FaVerified }),
      accountOwnershipOtp: "",
      setAccountOwnershipOtp: (accountOwnershipOtp: string) =>
        set({
          accountOwnershipOtp,
        }),
      qrCodeDataUrl: "",
      setQrCodeDataUrl: (qrCodeDataUrl) => set({ qrCodeDataUrl }),
      isDisable2FaClick: false,
      setIsDisable2FaClick: (isDisable2FaClick) => set({ isDisable2FaClick }),
      isConfirmDisable2Fa: false,
      setIsConfirmDisable2Fa: (isConfirmDisable2Fa) =>
        set({ isConfirmDisable2Fa }),
      cloudfareToken: null,
      setCloudfareToken: (cloudfareToken) => set({ cloudfareToken }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        authMethod: state.authMethod,
      }),
      onRehydrateStorage: (state) => {
        return (persistedState, error) => {
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
    },
  ),
);
