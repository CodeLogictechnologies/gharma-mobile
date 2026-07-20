import "@/global.css";
import NetworkButton from "@/components/common/NetworkButton";
import { useCustomerAddress } from "@/features/address/hooks";
import { useAddressStore, useHasAddress } from "@/features/address/store";
import { useFCMTokenManager } from "@/notifications/useNotificationToken";
import { useUpdateAndNotification } from "@/notifications/useUpdateAndNotification";
import AppProviders from "@/providers/AppProviders";
import { useAuthStore } from "@/store/useAuth";
import * as Location from "expo-location";
import { router, Slot, SplashScreen, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { startNetworkLogging } from "react-native-network-logger";
import { SafeAreaView } from "react-native-safe-area-context";

startNetworkLogging();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const authHydrated = useAuthStore((s) => s.hydrated);
  const addressHydrated = useAddressStore((s) => s.hydrated);
  const setPrefetchedLocation = useAddressStore((s) => s.setPrefetchedLocation);
  const [navigationReady, setNavigationReady] = useState(false);
  const [redirectHandled, setRedirectHandled] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  const isHydrated = authHydrated && addressHydrated;

  useEffect(() => {
    if (!isHydrated) return;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) setLocationFetched(true);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setPrefetchedLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setLocationFetched(true);
        }
      } catch (error) {
        console.warn("Splash location fetch error:", error);
        if (!cancelled) setLocationFetched(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, setPrefetchedLocation]);

  useEffect(() => {
    if (isHydrated && navigationReady && locationFetched) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Failed to hide splash screen:", err);
      });
    }
  }, [isHydrated, navigationReady, locationFetched]);

  if (!isHydrated) return null;

  return (
    <AppProviders>
      <AppNavigator
        onReady={() => setNavigationReady(true)}
        onRedirectHandled={() => setRedirectHandled(true)}
      />
      <NetworkButton />
    </AppProviders>
  );
}

interface AppNavigatorProps {
  onReady: () => void;
  onRedirectHandled: () => void;
}

function AppNavigator({ onReady, onRedirectHandled }: AppNavigatorProps) {
  const pathname = usePathname();
  const hasLocalAddress = useHasAddress();
  const hasNotifiedReady = useRef(false);

  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  const { data: apiRes, isLoading: apiLoading } = useCustomerAddress();
  const hasServerAddress =
    isLoggedIn && !!apiRes?.address && apiRes.address.length > 0;

  const hasAddress = isLoggedIn ? hasServerAddress : hasLocalAddress;
  const isAuthPage = pathname.startsWith("/(auth)") || pathname === "/address";

  useUpdateAndNotification();

  const { updateTokenAndSession, subscribeToRefresh } = useFCMTokenManager();

  useEffect(() => {
    const runFCM = async () => {
      try {
        await updateTokenAndSession();
      } catch (error) {
        console.error("[FCM] Initialization error:", error);
      }
    };

    runFCM();
    const unsubscribe = subscribeToRefresh();

    return unsubscribe;
  }, [updateTokenAndSession, subscribeToRefresh]);

  useEffect(() => {
    if (!hasNotifiedReady.current) {
      hasNotifiedReady.current = true;
      onReady();
    }
  }, [onReady]);

  useEffect(() => {
    if (isAuthPage) {
      onRedirectHandled();
      return;
    }

    if (isLoggedIn && apiLoading) return;

    const shouldRedirect = !hasAddress && pathname !== "/address";

    if (shouldRedirect) {
      router.replace("/address");
    }

    onRedirectHandled();
  }, [
    hasAddress,
    apiLoading,
    isLoggedIn,
    isAuthPage,
    pathname,
    onRedirectHandled,
  ]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot />
    </SafeAreaView>
  );
}
