import { getFCMTOken, subscribeToTokenRefresh } from "@/libs/notification";
import { useAuthStore } from "@/store/useAuth";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useCallback } from "react";

export const useFCMTokenManager = () => {
  const { fcmToken, updateFcmToken } = useNotificationStore();
  const { token: authToken } = useAuthStore();

  const updateTokenAndSession = useCallback(
    async (newToken?: string) => {
      if (!authToken) return;
      try {
        const tokenToUse = newToken ?? (await getFCMTOken()) ?? "test_token";

        if (tokenToUse !== fcmToken) {
          updateFcmToken(tokenToUse);
        }
        console.log({ tokenToUse, fcmToken });

        if (fcmToken === tokenToUse) return;
      } catch (error) {
        console.error("Error in FCM token management:", error);
      }
    },
    [fcmToken, updateFcmToken, authToken],
  );

  const subscribeToRefresh = useCallback(() => {
    return subscribeToTokenRefresh(updateTokenAndSession);
  }, [updateTokenAndSession]);

  return {
    updateTokenAndSession,
    subscribeToRefresh,
  };
};
