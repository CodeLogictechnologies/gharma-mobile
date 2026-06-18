import DeliveryTimelineSheet from "@/screen/delivery/component/DeliveryTimeLineSheet";
import { useGetdeliveryLocation } from "@/screen/delivery/hooks";
import BottomSheet from "@gorhom/bottom-sheet";
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
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  ListOrdered,
  MapPin,
  Navigation,
  Truck,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const fetchRoute = async (
  start: [number, number],
  end: [number, number],
): Promise<GeoJSON.FeatureCollection | null> => {
  try {
    const coords = `${start.join(",")};${end.join(",")}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.routes?.[0]?.geometry) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: json.routes[0].geometry,
        },
      ],
    };
  } catch {
    return null;
  }
};

export default function DeliveryTrackingMap() {
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const timelineSheetRef = useRef<BottomSheet>(null);

  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [routeData, setRouteData] = useState<GeoJSON.FeatureCollection | null>(
    null,
  );
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [userLiveLocation, setUserLiveLocation] = useState<
    [number, number] | null
  >(null);

  const {
    data: locationData,
    isLoading: isLoadingLocation,
    error,
  } = useGetdeliveryLocation(orderId || "");

  console.log("locationData", locationData, orderId);

  const driverLocation = locationData?.driverlocation;
  const userLocation = locationData?.customerlocation;

  // Parse coordinates
  const driverCoords: [number, number] | null = driverLocation
    ? [
        parseFloat(driverLocation.longitude),
        parseFloat(driverLocation.latitude),
      ]
    : null;

  const userCoords: [number, number] | null = userLocation
    ? [parseFloat(userLocation.longitude), parseFloat(userLocation.latitude)]
    : null;

  // Use API customer location OR fallback to live GPS location
  const displayUserCoords: [number, number] | null =
    userCoords || userLiveLocation;

  // Calculate center between driver and user
  const centerCoordinates: [number, number] | null =
    driverCoords && displayUserCoords
      ? [
          (driverCoords[0] + displayUserCoords[0]) / 2,
          (driverCoords[1] + displayUserCoords[1]) / 2,
        ]
      : displayUserCoords || driverCoords || null;

  // Determine driver status
  const hasDriverAssigned = !!driverLocation;
  const hasDriverStarted = !!driverCoords;

  // Handle user location updates
  const handleUserLocationUpdate = (location: {
    coords: { longitude: number; latitude: number };
  }) => {
    setUserLiveLocation([location.coords.longitude, location.coords.latitude]);
  };

  // Load route and fit camera when coordinates are available
  useEffect(() => {
    if (!driverCoords || !displayUserCoords) return;

    const loadRoute = async () => {
      setIsLoadingRoute(true);
      const route = await fetchRoute(driverCoords, displayUserCoords);
      setRouteData(route);
      setIsLoadingRoute(false);

      if (cameraRef.current) {
        const swLng = Math.min(driverCoords[0], displayUserCoords[0]);
        const swLat = Math.min(driverCoords[1], displayUserCoords[1]);
        const neLng = Math.max(driverCoords[0], displayUserCoords[0]);
        const neLat = Math.max(driverCoords[1], displayUserCoords[1]);

        const bounds: [number, number, number, number] = [
          swLng,
          swLat,
          neLng,
          neLat,
        ];

        cameraRef.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          duration: 1000,
        });
      }
    };

    loadRoute();
  }, [
    driverCoords?.[0],
    driverCoords?.[1],
    displayUserCoords?.[0],
    displayUserCoords?.[1],
  ]);

  // Fit to user location when only user location is available (no driver yet)
  useEffect(() => {
    if (!driverCoords && displayUserCoords && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: displayUserCoords,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  }, [driverCoords, displayUserCoords]);

  const openTimelineSheet = () => {
    timelineSheetRef.current?.snapToIndex(1);
  };

  // Loading state
  if (isLoadingLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text className="mt-4 text-gray-500">Loading location data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-2 pb-3 bg-white border-b border-gray-100 flex-row items-center z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-bold text-gray-900">
            Track Delivery
          </Text>
          <Text className="text-xs text-gray-500">
            Order #{orderId?.slice(-8)}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={openTimelineSheet}
            className="p-2 bg-gray-100 rounded-full"
          >
            <ListOrdered size={20} color="#374151" />
          </TouchableOpacity>
          <View
            className={`px-3 py-1.5 rounded-full border ${
              hasDriverStarted
                ? "bg-blue-50 border-blue-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                hasDriverStarted ? "text-blue-600" : "text-yellow-600"
              }`}
            >
              {hasDriverStarted ? "On the Way" : "Preparing"}
            </Text>
          </View>
        </View>
      </View>

      {/* Map */}
      <View className="flex-1 relative">
        <Map
          ref={mapRef}
          className="flex-1"
          mapStyle={MAP_STYLE}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Camera
            ref={cameraRef}
            center={centerCoordinates || [85.324, 27.7172]} // Default to Kathmandu
            zoom={13}
          />

          {/* Show user live location */}
          <UserLocation
            visible={true}
            onUpdate={handleUserLocationUpdate}
            androidRenderMode="normal"
          />

          {/* Route line (only when driver has started) */}
          {routeData && hasDriverStarted && (
            <GeoJSONSource id="route-source" data={routeData}>
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

          {/* Driver marker (only when driver has started) */}
          {hasDriverStarted && driverCoords && (
            <Marker id="driver-pin" lngLat={driverCoords} anchor="center">
              <View className="relative">
                <View className="absolute -inset-3 bg-blue-400/30 rounded-full animate-ping" />
                <View className="bg-white p-2.5 rounded-full border-2 border-blue-500 shadow-lg">
                  <Truck size={20} color="#1A73E8" />
                </View>
              </View>
            </Marker>
          )}

          {/* Customer/Delivery marker */}
          {displayUserCoords && (
            <Marker id="user-pin" lngLat={displayUserCoords} anchor="center">
              <View className="relative">
                <View className="absolute -inset-3 bg-green-400/20 rounded-full" />
                <View className="bg-white p-2.5 rounded-full border-2 border-green-500 shadow-lg">
                  <MapPin size={20} color="#16a34a" fill="#16a34a" />
                </View>
              </View>
            </Marker>
          )}
        </Map>

        {/* Loading overlay for route */}
        {isLoadingRoute && hasDriverStarted && (
          <View className="absolute inset-0 items-center justify-center bg-white/40">
            <ActivityIndicator size="large" color="#1A73E8" />
          </View>
        )}

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            onPress={openTimelineSheet}
            style={styles.fabButton}
          >
            <ListOrdered size={22} color="#1A73E8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (displayUserCoords && cameraRef.current) {
                cameraRef.current.setCamera({
                  centerCoordinate: displayUserCoords,
                  zoomLevel: 16,
                  animationDuration: 800,
                });
              }
            }}
            style={[styles.fabButton, { marginTop: 8 }]}
          >
            <Navigation size={22} color="#16A34A" />
          </TouchableOpacity>
        </View>

        {/* Bottom Info Card */}
        <View style={styles.bottomCard}>
          <View className="flex-row items-center gap-3">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
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
                  ? "Driver is on the way"
                  : "Waiting for driver"}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {hasDriverStarted
                  ? "Your order is being delivered"
                  : "Your order is being prepared. Driver will be assigned soon."}
              </Text>
            </View>
            <TouchableOpacity
              onPress={openTimelineSheet}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-xs font-semibold">Timeline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Order Timeline Bottom Sheet */}
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
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 120,
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
