import { Stack } from "expo-router";
import React from "react";

export default function DriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="drivermap" options={{ title: "drivermap" }} />
    </Stack>
  );
}
