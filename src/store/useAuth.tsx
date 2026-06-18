import { queryClient } from "@/libs/query";
import { storage } from "@/libs/store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refresh_token: string | null;
  selectedRole: string | null;
  role_id: number | null;
  hydrated: boolean;
  logIn: (token: string, refreshToken: string) => void;
  setSelectedRole: (role: string) => void;
  setRoleId: (roleId: number) => void;
  logOut: () => void;
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refresh_token: null,
      selectedRole: null,
      role_id: null,
      hydrated: false,

      logIn: (token, refreshToken) =>
        set({ token, refresh_token: refreshToken }),

      setSelectedRole: (role) => set({ selectedRole: role }),
      setRoleId: (roleId) => set({ role_id: roleId }),

      logOut: () => {
        set({
          token: null,
          refresh_token: null,
          selectedRole: null,
          role_id: null,
        });
        queryClient.clear();
      },

      setToken: (token) => set({ token }),

      setRefreshToken: (token) => set({ refresh_token: token }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "auth-token",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        token: state.token,
        refresh_token: state.refresh_token,
        selectedRole: state.selectedRole,
        role_id: state.role_id,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
