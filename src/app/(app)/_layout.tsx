import { useAuthStore } from "@/store/useAuth";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

const AppLayout = () => {
  const [loaded, error] = useFonts({
    "Inter-Thin": require("assets/fonts/Inter/static/Inter_18pt-Thin.ttf"),
    "Inter-Light": require("assets/fonts/Inter/static/Inter_18pt-Light.ttf"),
    "Inter-Regular": require("assets/fonts/Inter/static/Inter_18pt-Regular.ttf"),
    "Inter-SemiBold": require("assets/fonts/Inter/static/Inter_28pt-SemiBold.ttf"),
    "Inter-Bold": require("assets/fonts/Inter/static/Inter_18pt-Bold.ttf"),

    "SF-Pro": require("assets/fonts/sfpro/SF-Pro.ttf"),
  });
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (loaded || error) {
      <></>;
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // if (!token) {
  //   return <Redirect href="/(auth)/login" />;
  // }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="changepassword" />
      <Stack.Screen
        name="productdetails"
        options={{
          animation: "fade",
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AppLayout;
