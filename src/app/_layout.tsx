import "@/global.css";
import { queryClient } from "@/libs/query";
import { useAddressStore } from "@/screen/address/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Slot, SplashScreen } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { ChartNetwork } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { startNetworkLogging } from "react-native-network-logger";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "../store/useAuth";

startNetworkLogging();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const authHydrated = useAuthStore((s) => s.hydrated);
  const addressHydrated = useAddressStore((s) => s.hydrated);

  const isHydrated = authHydrated && addressHydrated;

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Failed to hide splash screen:", err);
      });
    }
  }, [isHydrated]);

  if (!isHydrated) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <HeroUINativeProvider config={{ toast: true }}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <SafeAreaView style={{ flex: 1 }}>
              <Slot />
            </SafeAreaView>
            <NetworkButton />
          </HeroUINativeProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

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