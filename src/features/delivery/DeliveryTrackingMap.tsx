import SmoothMarker, { distanceMeters } from "@/components/map/SmoothMarker";
import { TRACKING } from "@/constants/tracking";
import DeliveryStatusStepper from "@/features/delivery/components/DeliveryStatusStepper";
import DeliveryTimelineSheet from "@/features/delivery/components/DeliveryTimeLineSheet";
import { useGetdeliveryLocation } from "@/features/delivery/hooks";
import BottomSheet from "@expo/ui/community/bottom-sheet";
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  MapRef,
  Marker,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { router, useIsFocused, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  ListOrdered,
  Locate,
  MapPin,
  RefreshCw,
  Scan,
  Truck,
  WifiOff,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const KATHMANDU: [number, number] = [85.324, 27.7172];

interface RouteResult {
  geojson: GeoJSON.FeatureCollection;
  durationSec: number | null;
}

const fetchRoute = async (
  start: [number, number],
  end: [number, number],
): Promise<RouteResult | null> => {
  try {
    const coords = `${start.join(",")};${end.join(",")}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const route = json.routes?.[0];
    if (!route?.geometry) return null;
    return {
      geojson: {
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: {}, geometry: route.geometry },
        ],
      },
      durationSec: typeof route.duration === "number" ? route.duration : null,
    };
  } catch {
    return null;
  }
};

const LivePulseDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="w-2 h-2 rounded-full bg-green-600"
    />
  );
};

export default function DeliveryTrackingMap() {
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const timelineSheetRef = useRef<BottomSheet>(null);
  const isFocused = useIsFocused();

  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [fallbackUserCoords, setFallbackUserCoords] = useState<
    [number, number] | null
  >(null);

  const hasFittedCamera = useRef(false);
  const lastRouteOrigin = useRef<[number, number] | null>(null);

  const {
    data: locationData,
    isLoading: isLoadingLocation,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useGetdeliveryLocation(orderId || "", isFocused);

  const driverCoords = useMemo<[number, number] | null>(() => {
    const loc = locationData?.driverlocation;
    if (!loc) return null;
    const lng = parseFloat(loc.longitude);
    const lat = parseFloat(loc.latitude);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }, [
    locationData?.driverlocation?.longitude,
    locationData?.driverlocation?.latitude,
  ]);

  const apiUserCoords = useMemo<[number, number] | null>(() => {
    const loc = locationData?.customerlocation;
    if (!loc) return null;
    const lng = parseFloat(loc.longitude);
    const lat = parseFloat(loc.latitude);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }, [
    locationData?.customerlocation?.longitude,
    locationData?.customerlocation?.latitude,
  ]);

  const userCoords = apiUserCoords ?? fallbackUserCoords;

  const hasDriverAssigned = !!locationData?.driverlocation;
  const hasDriverStarted = !!driverCoords;

  const isLive =
    hasDriverStarted &&
    !isError &&
    Date.now() - dataUpdatedAt < TRACKING.CUSTOMER_POLL_MS * 3;

  useEffect(() => {
    if (apiUserCoords || fallbackUserCoords) return;
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") return;
        const last = await Location.getLastKnownPositionAsync();
        const pos =
          last ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));
        if (!cancelled && pos) {
          setFallbackUserCoords([pos.coords.longitude, pos.coords.latitude]);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [apiUserCoords, fallbackUserCoords]);

  const fitToBoth = useCallback(
    (animated = true) => {
      if (!driverCoords || !userCoords || !cameraRef.current) return;
      cameraRef.current.fitBounds(
        [
          Math.min(driverCoords[0], userCoords[0]),
          Math.min(driverCoords[1], userCoords[1]),
          Math.max(driverCoords[0], userCoords[0]),
          Math.max(driverCoords[1], userCoords[1]),
        ],
        {
          padding: { top: 110, bottom: 240, left: 60, right: 60 },
          duration: animated ? 900 : 0,
        },
      );
    },
    [driverCoords, userCoords],
  );

  useEffect(() => {
    if (hasFittedCamera.current) return;
    if (driverCoords && userCoords) {
      hasFittedCamera.current = true;
      fitToBoth();
    } else if (userCoords && cameraRef.current) {
      cameraRef.current.easeTo({
        center: userCoords,
        zoom: 15,
        duration: 800,
      });
    }
  }, [driverCoords, userCoords, fitToBoth]);

  useEffect(() => {
    if (!driverCoords || !userCoords) return;

    const movedEnough =
      !lastRouteOrigin.current ||
      distanceMeters(lastRouteOrigin.current, driverCoords) >
        TRACKING.ROUTE_REFRESH_DISTANCE_M;
    if (!movedEnough) return;

    let cancelled = false;
    (async () => {
      if (!route) setIsLoadingRoute(true);
      const result = await fetchRoute(driverCoords, userCoords);
      if (cancelled) return;
      if (result) {
        setRoute(result);
        lastRouteOrigin.current = driverCoords;
      }
      setIsLoadingRoute(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [driverCoords?.[0], driverCoords?.[1], userCoords?.[0], userCoords?.[1]]);

  const etaMinutes =
    route?.durationSec != null
      ? Math.max(1, Math.round(route.durationSec / 60))
      : null;

  const openTimelineSheet = () => timelineSheetRef.current?.snapToIndex(1);

  if (isLoadingLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
          <Truck size={28} color="#1A73E8" />
        </View>
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text className="mt-4 text-base font-semibold text-gray-900">
          Locating your order
        </Text>
        <Text className="mt-1 text-xs text-gray-500 text-center">
          Fetching the latest delivery position…
        </Text>
      </View>
    );
  }

  if (isError && !locationData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <WifiOff size={28} color="#DC2626" />
        </View>
        <Text className="text-lg font-bold text-gray-900 mb-1">
          Can&apos;t reach tracking
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-5">
          {error?.message?.includes("Network")
            ? "You appear to be offline. Check your connection and try again."
            : "We couldn't load the delivery position. Please try again."}
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-5 py-3 rounded-lg border border-gray-300"
          >
            <Text className="text-gray-700 font-semibold">Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refetch()}
            className="px-5 py-3 rounded-lg bg-primary flex-row items-center gap-2"
          >
            <RefreshCw size={16} color="white" />
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 relative">
        <Map ref={mapRef} className="flex-1" mapStyle={MAP_STYLE}>
          <Camera
            ref={cameraRef}
            center={userCoords ?? driverCoords ?? KATHMANDU}
            zoom={13}
          />

          <UserLocation animated minDisplacement={10} />

          {route && hasDriverStarted && (
            <GeoJSONSource id="route-source" data={route.geojson}>
              <Layer
                id="route-casing"
                type="line"
                paint={{
                  "line-color": "#1565C0",
                  "line-width": 6,
                  "line-opacity": 0.2,
                }}
              />
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": "#1A73E8",
                  "line-width": 4,
                  "line-opacity": 0.9,
                }}
              />
            </GeoJSONSource>
          )}

          {hasDriverStarted && driverCoords && (
            <SmoothMarker
              id="driver-pin"
              coordinate={driverCoords}
              durationMs={TRACKING.CUSTOMER_POLL_MS}
              rotateToMovement
            >
              <View className="bg-white p-2.5 rounded-full border-2 border-blue-500 shadow-lg">
                <Truck size={20} color="#1A73E8" />
              </View>
            </SmoothMarker>
          )}

          {userCoords && (
            <Marker id="user-pin" lngLat={userCoords} anchor="center">
              <View className="relative">
                <View className="absolute -inset-3 bg-green-400/20 rounded-full" />
                <View className="bg-white p-2.5 rounded-full border-2 border-green-500 shadow-lg">
                  <MapPin size={20} color="#16a34a" fill="#16a34a" />
                </View>
              </View>
            </Marker>
          )}
        </Map>

        <View style={styles.headerOverlay} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.roundButton}
          >
            <ChevronLeft size={22} color="#1f2937" />
          </TouchableOpacity>

          <View style={styles.headerPill}>
            <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
              Track Delivery
            </Text>
            <Text className="text-[11px] text-gray-500">
              Order #{orderId?.slice(-8)}
            </Text>
          </View>

          <View
            className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
              isLive
                ? "bg-green-50 border-green-200"
                : hasDriverStarted
                  ? "bg-blue-50 border-blue-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
            style={styles.statusChipShadow}
          >
            {isLive && <LivePulseDot />}
            <Text
              className={`text-xs font-semibold ${
                isLive
                  ? "text-green-700"
                  : hasDriverStarted
                    ? "text-blue-600"
                    : "text-yellow-600"
              }`}
            >
              {isLive ? "Live" : hasDriverStarted ? "On the Way" : "Preparing"}
            </Text>
          </View>
        </View>

        {isError && locationData && (
          <View style={styles.reconnectBanner}>
            <WifiOff size={14} color="#B45309" />
            <Text className="text-xs font-medium text-yellow-700">
              Connection lost — retrying…
            </Text>
          </View>
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity
            onPress={() => fitToBoth()}
            style={styles.fabButton}
          >
            <Scan size={22} color="#1A73E8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (userCoords && cameraRef.current) {
                cameraRef.current.easeTo({
                  center: userCoords,
                  zoom: 16,
                  duration: 800,
                });
              }
            }}
            style={[styles.fabButton, { marginTop: 8 }]}
          >
            <Locate size={22} color="#16A34A" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCard}>
          <DeliveryStatusStepper
            driverAssigned={hasDriverAssigned}
            driverStarted={hasDriverStarted}
          />

          <View className="h-px bg-gray-100 mb-3" />

          <View className="flex-row items-center gap-3">
            <View
              className={`w-11 h-11 rounded-full items-center justify-center ${
                hasDriverStarted ? "bg-blue-100" : "bg-yellow-100"
              }`}
            >
              {hasDriverStarted ? (
                <Truck size={20} color="#1A73E8" />
              ) : (
                <MapPin size={20} color="#CA8A04" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-900">
                {hasDriverStarted
                  ? etaMinutes != null
                    ? `Arriving in ~${etaMinutes} min`
                    : "Driver is on the way"
                  : "Waiting for driver"}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>
                {hasDriverStarted
                  ? isLive
                    ? "Live location updates every few seconds"
                    : "Your order is being delivered"
                  : "Your order is being prepared. A driver will be assigned soon."}
              </Text>
            </View>
            <TouchableOpacity
              onPress={openTimelineSheet}
              className="bg-primary px-4 py-2.5 rounded-lg flex-row items-center gap-1.5"
            >
              <ListOrdered size={14} color="white" />
              <Text className="text-white text-xs font-semibold">Timeline</Text>
            </TouchableOpacity>
          </View>

          {isLoadingRoute && hasDriverStarted && (
            <View className="flex-row items-center gap-2 mt-3">
              <ActivityIndicator size="small" color="#1A73E8" />
              <Text className="text-xs text-gray-400">Calculating route…</Text>
            </View>
          )}
        </View>
      </View>

      <DeliveryTimelineSheet
        sheetRef={timelineSheetRef}
        orderId={orderId || ""}
        driverAssigned={hasDriverAssigned}
        driverStarted={hasDriverStarted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  headerPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusChipShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reconnectBanner: {
    position: "absolute",
    top: 62,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 208,
    alignItems: "center",
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});
