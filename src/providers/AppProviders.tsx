import { queryClient } from "@/libs/query";
import { BottomSheetModalProvider } from "@expo/ui/community/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUINativeProvider } from "heroui-native";
import React from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
          <BottomSheetModalProvider>
            <KeyboardProvider>
              <HeroUINativeProvider config={{ toast: true }}>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor="transparent"
                  translucent={true}
                />
                {children}
              </HeroUINativeProvider>
            </KeyboardProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default AppProviders;
