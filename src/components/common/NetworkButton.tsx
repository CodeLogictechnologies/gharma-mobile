import { router } from "expo-router";
import { ChartNetwork } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

const NetworkButton = () => (
  <Pressable
    style={{
      position: "absolute",
      bottom: 80,
      right: 20,
      backgroundColor: "rgba(52, 52, 52, 0.6)",
      padding: 12,
      borderRadius: 50,
      elevation: 50,
      zIndex: 9999,
    }}
    onPress={() => router.navigate("/network")}
  >
    <ChartNetwork width={24} height={24} color="#fff" />
  </Pressable>
);

export default NetworkButton;
