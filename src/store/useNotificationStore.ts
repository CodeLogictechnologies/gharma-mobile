import { zustandStorage } from "@/libs/mmkvstore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationState {
  fcmToken: string | null;
  updateFcmToken: (token: string | null) => void;
  clearFcmToken: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      fcmToken: null,
      updateFcmToken: (token) => set({ fcmToken: token }),
      clearFcmToken: () => set({ fcmToken: null }),
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
