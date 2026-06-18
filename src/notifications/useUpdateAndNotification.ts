import {
  notificationListner,
  requestUserPermission,
} from "@/libs/notification";
import * as ExpoInAppUpdates from "expo-in-app-updates";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";

export const useUpdateAndNotification = () => {
  const checkForUpdates = async () => {
    try {
      if (Platform.OS === "android") {
        await ExpoInAppUpdates.checkAndStartUpdate(true);
      } else {
        const result = await ExpoInAppUpdates.checkForUpdate();

        if (!result.updateAvailable) return;

        Alert.alert(
          "Update available",
          "A new version of the app is available with many improvements and bug fixes. Would you like to update now?",
          [
            {
              text: "Update",
              isPreferred: true,
              onPress: async () => {
                try {
                  await ExpoInAppUpdates.startUpdate();
                } catch (err) {
                  console.error("Failed to start update:", err);
                }
              },
            },
            { text: "Cancel" },
          ],
        );
      }
    } catch (err) {
      console.error("Update check failed:", err);
    }
  };

  useEffect(() => {
    requestUserPermission();
    checkForUpdates();
    notificationListner();
  }, []);
};
