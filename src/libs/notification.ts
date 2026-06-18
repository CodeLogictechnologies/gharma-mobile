import * as Notifications from "expo-notifications";

import { useNotificationStore } from "@/store/useNotificationStore";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

const remoteNotify = async (remoteMessage: any) => {
  console.log("remoteMessage", remoteMessage);
  if (!remoteMessage?.notification?.title) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      sound: "notify",
      color: "#BC1419",
    },
    trigger: null,
  });
};

export const localNotify = async (title: string, body?: string) => {
  if (!title) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "notify",
      color: "#BC1419",
    },
    trigger: null,
  });
};

export const requestUserPermission = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("sms_mobile_channel", {
        name: "sms_mobile_channel",
        importance: Notifications.AndroidImportance.MAX,
        sound: "notify",
        vibrationPattern: [0, 250, 250, 250],
        enableLights: true,
        lightColor: "#BC1419",
      });
    }
    await getFCMTOken();
  } catch (err) {
    console.log(err);
  }
};

export const getFCMTOken = async () => {
  try {
    const { fcmToken, updateFcmToken } = useNotificationStore.getState();

    if (fcmToken) return fcmToken; // Return stored token if it exists
    // await messaging().registerDeviceForRemoteMessages();
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const token = tokenResponse.data;
    if (token) {
      updateFcmToken(token); // Store token in Zustand
      return token;
    }

    return undefined; // Explicitly return undefined if no token is retrieved
  } catch (err) {
    console.log(err);
  }
};

export const notificationListner = () => {
  if (Platform.OS === "android") {
    Notifications.getNotificationChannelsAsync().then((value) =>
      console.log(value ?? []),
    );
  }

  const receivedListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received:", notification);
    },
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      // handleNotificationNavigation(remoteMessage);
    });

  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
};

const handleNotificationNavigation = (remoteMessage: any) => {};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.log(err);
  }
};

export const unsubscribeFromFCM = async () => {
  try {
    const fcmToken = useNotificationStore.getState().fcmToken;
    if (fcmToken) {
      // Unsubscribe from topics if needed
      // await messaging().unsubscribeFromTopic('sms_mobile_channel');

      // Delete the FCM token
      // await messaging().deleteToken();
      useNotificationStore.setState({ fcmToken: undefined });
    }
  } catch (err) {
    console.log(err);
  }
};

export const subscribeToTokenRefresh = (onRefresh: (token: string) => void) => {
  // return messaging().onTokenRefresh(token => {
  //   console.log('refreshToken', token);
  //   onRefresh(token);
  // });
};
