import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  // const token = useAuthStore((s) => s.token);

  // console.log("token", token);
  // if (token) {
  //   return <Redirect href="/(app)/(tabs)" />;
  // }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="verifyotp" />
      <Stack.Screen name="resetpassword" />
      <Stack.Screen name="forgotpassword" />
      <Stack.Screen name="registerretailer" />
      <Stack.Screen name="wholesalerregister" />
    </Stack>
  );
};

export default AuthLayout;
