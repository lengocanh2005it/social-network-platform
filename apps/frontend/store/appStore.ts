import { AuthMethod, OAuthNames, Provider, Tokens } from "@/utils";
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
    }
  )
);
