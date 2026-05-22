import { queryClient } from "@/libs/query";
import { storage } from "@/libs/store";
import { useAddressStore } from "@/screen/address/store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  hydrated: boolean;
  logIn: (token: string) => void;
  logOut: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      hydrated: false,

      logIn: (token) => set({ token }),

      logOut: () => {
        set({ token: null });
        queryClient.clear();
        useAddressStore.getState().clearAll();
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "auth-token",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
