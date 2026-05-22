import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="productsearch" />
      <Stack.Screen name="favouritelist" />
      <Stack.Screen name="cartlist" />
      <Stack.Screen name="morepage" />
    </Stack>
  );
};

export default _layout;
