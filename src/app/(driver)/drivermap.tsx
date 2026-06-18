import {
  useChangeDeliveryStatus,
  useCheckOTP,
  useDeliveryDetails,
  useSaveTrackingLocation,
} from "@/screen/driver/hooks";
import { CustomerOrderDetail } from "@/screen/driver/types";
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  MapRef,
  Marker,
} from "@maplibre/maplibre-react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  ChevronLeft,
  MapPin,
  Navigation,
  Package,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import OtpVerificationModal from "@/screen/driver/component/OtpVerificationModal";
import StopCard from "@/screen/driver/component/StopCard";
import { useDriverLocation } from "@/screen/driver/hooks/useDriverLocation";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type StopStatus = "PENDING" | "EN_ROUTE" | "COMPLETED";

export interface DeliveryStop {
  id: string;
  label: string;
  address: string;
  customerName: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: StopStatus;
  apiStatus: string;
  assignorderid: string | null;
  routeData: GeoJSON.FeatureCollection | null;
}

const ROUTE_COLORS = ["#1A73E8", "#E8711A", "#1AE871"];
const ROUTE_CASING_COLORS = ["#1565C0", "#B85B14", "#14B85B"];

const fetchRoute = async (
  start: [number, number],
  end: [number, number],
): Promise<GeoJSON.Geometry> => {
  const coords = `${start.join(",")};${end.join(",")}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch route");
  const json = await res.json();
  if (!json.routes?.[0]?.geometry) throw new Error("No route found");
  return json.routes[0].geometry;
};

export default function DriverMap() {
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const { location: driverLocation, isLoading: isLocationLoading } =
    useDriverLocation();

  // NEW: Get orderids from params (comma-separated string)
  const { orderids } = useLocalSearchParams<{
    orderids?: string;
  }>();

  // Parse comma-separated order IDs into array
  const orderIdsArray = orderids ? orderids.split(",") : [];

  const {
    data: apiData,
    isLoading: isLoadingApi,
    isError: isErrorApi,
  } = useDeliveryDetails(orderIdsArray);

  const changeStatusMutation = useChangeDeliveryStatus();
  const checkOtpMutation = useCheckOTP();
  const saveTrackingLocationMutation = useSaveTrackingLocation();

  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpModalKey, setOtpModalKey] = useState(0);

  const activeStop = stops.find((s) => s.id === activeStopId) ?? null;
  const allCompleted = stops.every((s) => s.status === "COMPLETED");
  const hasActiveDelivery = stops.some((s) => s.status === "EN_ROUTE");

  // Map API status to local StopStatus
  const mapApiStatus = (apiStatus: string): StopStatus => {
    const status = apiStatus.toLowerCase();
    if (
      status === "start" ||
      status === "dispatched" ||
      status === "en_route"
    ) {
      return "EN_ROUTE";
    }
    if (status === "complete" || status === "delivered") {
      return "COMPLETED";
    }
    return "PENDING";
  };

  // Build stops from API response
  useEffect(() => {
    if (!apiData?.data) return;

    const apiStops: DeliveryStop[] = apiData.data.map(
      (customer: CustomerOrderDetail, idx: number) => ({
        id: customer.order_id,
        label: `Stop ${idx + 1}`,
        address: customer.address_name,
        customerName: customer.customer_name,
        phone: customer.phone,
        latitude: parseFloat(customer.latitude),
        longitude: parseFloat(customer.longitude),
        status: mapApiStatus(customer.order_status),
        apiStatus: customer.order_status,
        assignorderid: customer.assignorderid,
        routeData: null,
      }),
    );

    setStops(apiStops);

    // Auto-select first pending stop if none active
    const firstPending = apiStops.find((s) => s.status === "PENDING");
    if (firstPending && !apiStops.some((s) => s.status === "EN_ROUTE")) {
      setActiveStopId(firstPending.id);
    }
  }, [apiData]);

  // Fetch routes when stops are built or driver location changes significantly
  useEffect(() => {
    if (stops.length === 0) return;

    let mounted = true;
    const loadAll = async () => {
      setLoadingRoutes(true);
      const results = await Promise.allSettled(
        stops.map((stop) =>
          fetchRoute(
            [driverLocation.longitude, driverLocation.latitude],
            [stop.longitude, stop.latitude],
          ).then((geometry) => ({
            id: stop.id,
            routeData: {
              type: "FeatureCollection" as const,
              features: [
                { type: "Feature" as const, properties: {}, geometry },
              ],
            },
          })),
        ),
      );

      if (!mounted) return;

      setStops((prev) =>
        prev.map((stop) => {
          const match = results.find(
            (r) => r.status === "fulfilled" && r.value.id === stop.id,
          );
          if (match && match.status === "fulfilled") {
            return { ...stop, routeData: match.value.routeData };
          }
          return stop;
        }),
      );
      setLoadingRoutes(false);
    };

    loadAll();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length, driverLocation.latitude, driverLocation.longitude]);

  // POLLING: Save driver location every 1 minute when there's an active delivery
  useEffect(() => {
    if (!activeStop || activeStop.status !== "EN_ROUTE") return;
    if (!driverLocation.latitude || !driverLocation.longitude) return;

    const intervalId = setInterval(() => {
      saveTrackingLocationMutation.mutate({
        latitude: driverLocation.latitude.toString(),
        longitude: driverLocation.longitude.toString(),
        order_id: activeStop.id,
      });
    }, 60000); // 1 minute (fixed from 6000)

    return () => clearInterval(intervalId);
  }, [
    activeStop?.id,
    activeStop?.status,
    driverLocation.latitude,
    driverLocation.longitude,
    saveTrackingLocationMutation,
  ]);

  const handleSelectStop = useCallback(
    (stopId: string) => {
      const stop = stops.find((s) => s.id === stopId);
      if (!stop || stop.status === "COMPLETED") return;
      setActiveStopId(stopId);
      cameraRef.current?.flyTo({
        center: [stop.longitude, stop.latitude],
        zoom: 13,
        duration: 800,
      });
    },
    [stops],
  );

  const handleStartDelivery = useCallback(
    async (stop: DeliveryStop) => {
      if (!stop.assignorderid) return;

      try {
        await changeStatusMutation.mutateAsync({
          status: "Start",
          assignorderid: stop.assignorderid,
          order_id: stop.id,
          latitude: driverLocation.latitude.toString(),
          longitude: driverLocation.longitude.toString(),
        });

        setStops((prev) =>
          prev.map((s) =>
            s.id === stop.id
              ? { ...s, status: "EN_ROUTE", apiStatus: "start" }
              : s,
          ),
        );
        cameraRef.current?.flyTo({
          center: [stop.longitude, stop.latitude],
          zoom: 14,
          duration: 1000,
        });

        saveTrackingLocationMutation.mutate({
          latitude: driverLocation.latitude.toString(),
          longitude: driverLocation.longitude.toString(),
          order_id: stop.id,
        });
      } catch (error) {}
    },
    [changeStatusMutation, driverLocation, saveTrackingLocationMutation],
  );

  const handleCompleteDelivery = useCallback(
    async (stop: DeliveryStop) => {
      if (!stop.assignorderid) return;

      try {
        await changeStatusMutation.mutateAsync({
          status: "Complete",
          assignorderid: stop.assignorderid,
          order_id: stop.id,
        });

        setOtpModalKey((prev) => prev + 1);
        setShowOtpModal(true);
      } catch (error) {}
    },
    [changeStatusMutation],
  );

  const handleActionButton = useCallback(() => {
    if (!activeStop) return;

    if (activeStop.status === "PENDING") {
      handleStartDelivery(activeStop);
    } else if (activeStop.status === "EN_ROUTE") {
      handleCompleteDelivery(activeStop);
    }
  }, [activeStop, handleStartDelivery, handleCompleteDelivery]);

  // Verify OTP
  const handleVerifyOtp = useCallback(
    async (otp: string) => {
      if (!activeStop) return;

      try {
        await checkOtpMutation.mutateAsync({
          otp,
          order_id: activeStop.id,
        });

        setShowOtpModal(false);

        setStops((prev) =>
          prev.map((s) =>
            s.id === activeStopId
              ? { ...s, status: "COMPLETED", apiStatus: "complete" }
              : s,
          ),
        );

        const nextStop = stops.find(
          (s) => s.id !== activeStopId && s.status === "PENDING",
        );
        if (nextStop) {
          setActiveStopId(nextStop.id);
          cameraRef.current?.flyTo({
            center: [nextStop.longitude, nextStop.latitude],
            zoom: 13,
            duration: 800,
          });
        } else {
          setActiveStopId(null);
        }
      } catch (error) {}
    },
    [activeStop, activeStopId, stops, checkOtpMutation],
  );

  const centerCoordinates: [number, number] =
    stops.length > 0
      ? [
          (stops.reduce((s, p) => s + p.longitude, 0) +
            driverLocation.longitude) /
            (stops.length + 1),
          (stops.reduce((s, p) => s + p.latitude, 0) +
            driverLocation.latitude) /
            (stops.length + 1),
        ]
      : [driverLocation.longitude, driverLocation.latitude];

  const completedCount = stops.filter((s) => s.status === "COMPLETED").length;

  const getButtonConfig = (stop: DeliveryStop) => {
    const apiStatus = stop.apiStatus.toLowerCase();

    if (
      apiStatus === "complete" ||
      apiStatus === "delivered" ||
      stop.status === "COMPLETED"
    ) {
      return {
        text: "Delivered",
        bgColor: "bg-green-600",
        disabled: true,
      };
    }

    if (apiStatus === "start" || stop.status === "EN_ROUTE") {
      return {
        text: `Complete Delivery - ${stop.label}`,
        bgColor: "bg-green-600",
        disabled: false,
      };
    }

    return {
      text: `Start Route to ${stop.label}`,
      bgColor: "bg-yellow-500",
      disabled: false,
    };
  };

  // Combined loading state
  if (isLoadingApi) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text className="text-gray-500 mt-3">
          {isLocationLoading
            ? "Getting your location..."
            : "Loading delivery details..."}
        </Text>
      </View>
    );
  }

  if (isErrorApi) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Failed to load
        </Text>
        <Text className="text-gray-500 text-center mb-4">
          Could not fetch customer details. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stops.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-gray-500 text-lg mb-2">No deliveries found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMutating =
    changeStatusMutation.isPending || checkOtpMutation.isPending;
  const buttonConfig = activeStop ? getButtonConfig(activeStop) : null;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View>
          <Text className="text-lg font-bold text-gray-900 text-center">
            Delivery Route
          </Text>
          <Text className="text-xs text-gray-400 text-center">
            {completedCount}/{stops.length} stops completed
          </Text>
        </View>
        <View
          className={`px-2.5 py-1 rounded-full ${allCompleted ? "bg-green-100" : "bg-blue-100"}`}
        >
          <Text
            className={`text-xs font-semibold ${allCompleted ? "text-green-700" : "text-blue-700"}`}
          >
            {allCompleted ? "All Done" : "Active"}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View className="flex-1 relative">
        <Map ref={mapRef} className="flex-1" mapStyle={MAP_STYLE}>
          <Camera ref={cameraRef} center={centerCoordinates} zoom={12} />

          {stops.map((stop, idx) => {
            if (!stop.routeData || stop.status === "COMPLETED") return null;
            const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
            const casing =
              ROUTE_CASING_COLORS[idx % ROUTE_CASING_COLORS.length];
            const isActive = stop.id === activeStopId;
            return (
              <GeoJSONSource
                key={stop.id}
                id={`route-source-${stop.id}`}
                data={stop.routeData}
              >
                <Layer
                  id={`route-casing-${stop.id}`}
                  type="line"
                  paint={{
                    "line-color": casing,
                    "line-width": isActive ? 8 : 5,
                    "line-opacity": isActive ? 0.35 : 0.15,
                  }}
                />
                <Layer
                  id={`route-line-${stop.id}`}
                  type="line"
                  paint={{
                    "line-color": color,
                    "line-width": isActive ? 5 : 3,
                    "line-opacity": isActive ? 1 : 0.45,
                    ...(isActive ? {} : { "line-dasharray": [4, 3] }),
                  }}
                />
              </GeoJSONSource>
            );
          })}

          {/* Driver Location Marker */}
          <Marker
            id="driver-pin"
            lngLat={[driverLocation.longitude, driverLocation.latitude]}
            anchor="center"
          >
            <View className="bg-white p-2 rounded-full border-2 border-blue-500 shadow-md">
              <Navigation size={18} color="#3B82F6" fill="#3B82F6" />
            </View>
          </Marker>

          {stops.map((stop, idx) => {
            const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
            const isCompleted = stop.status === "COMPLETED";
            return (
              <Marker
                key={stop.id}
                id={`dest-pin-${stop.id}`}
                lngLat={[stop.longitude, stop.latitude]}
                anchor="center"
                onPress={() => handleSelectStop(stop.id)}
              >
                <View
                  className={`p-2 rounded-full border-2 shadow-md ${
                    isCompleted
                      ? "bg-green-100 border-green-500"
                      : "bg-white border-yellow-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={20} color="#16a34a" />
                  ) : (
                    <MapPin size={20} color={color} fill={color} />
                  )}
                </View>
              </Marker>
            );
          })}
        </Map>

        {loadingRoutes && (
          <View className="absolute inset-0 items-center justify-center bg-white/30">
            <ActivityIndicator size="large" color="#1A73E8" />
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      <View className="bg-white pt-4 pb-8 rounded-t-[24px] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-4"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {stops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              isActive={activeStopId === stop.id}
              onPress={() => handleSelectStop(stop.id)}
            />
          ))}
        </ScrollView>

        <View className="px-5">
          {allCompleted ? (
            <View className="py-3.5 rounded-md flex-row justify-center items-center gap-2 bg-green-600">
              <Package size={18} color="white" />
              <Text className="text-white text-base font-semibold">
                All Deliveries Completed!
              </Text>
            </View>
          ) : activeStop && buttonConfig ? (
            <>
              <View className="mb-3">
                <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Selected Stop
                </Text>
                <Text className="text-[16px] text-gray-800 font-medium">
                  {activeStop.label} · {activeStop.address}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {activeStop.customerName} · {activeStop.phone}
                </Text>
              </View>
              <TouchableOpacity
                className={`py-3.5 rounded-md flex-row justify-center items-center gap-2 shadow-sm ${buttonConfig.bgColor}`}
                onPress={handleActionButton}
                disabled={buttonConfig.disabled || isMutating || loadingRoutes}
              >
                {isMutating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    {buttonConfig.text}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View className="py-3.5 rounded-md flex-row justify-center items-center bg-gray-100">
              <Text className="text-gray-500 text-sm font-medium">
                Tap a stop on the map or above to begin
              </Text>
            </View>
          )}
        </View>
      </View>

      <OtpVerificationModal
        key={otpModalKey}
        visible={showOtpModal}
        stop={activeStop}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOtp}
        isVerifying={checkOtpMutation.isPending}
      />
    </View>
  );
}
