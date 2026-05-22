// app/address.tsx
import { useDeliveryZone } from "@/hooks/UseDeliveryZone";
import { useSaveUserAddress } from "@/screen/address/hooks";
import { useAddressStore } from "@/screen/address/store";
import { useAuthStore } from "@/store/useAuth";
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  MapRef,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Crosshair,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const searchLocations = async (query: string) => {
  if (!query.trim() || query.length < 3) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return (data.features ?? []).map((item: any) => ({
      id: item.properties.osm_id ?? Math.random().toString(),
      name: [
        item.properties.name,
        item.properties.street,
        item.properties.city,
        item.properties.country,
      ]
        .filter(Boolean)
        .join(", "),
      lat: item.geometry.coordinates[1],
      lon: item.geometry.coordinates[0],
      type: item.properties.type,
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "GHARMA/1.0 (bibash.thapa7@gmail.com)",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.display_name ?? "Unknown Location";
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return "Unknown Location";
  }
};

const getCurrentCoords = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      const last = await Location.getLastKnownPositionAsync();
      if (last)
        return {
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        };
      return null;
    }
  } catch (error) {
    console.warn("Location error:", error);
    return null;
  }
};

function buildCircleGeoJSON(
  lat: number,
  lon: number,
  radiusMeters: number,
  steps = 64,
): GeoJSON.FeatureCollection {
  const coords: [number, number][] = [];
  const earthRadius = 6371000;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const dLon =
      ((radiusMeters / earthRadius) * (180 / Math.PI)) /
      Math.cos((lat * Math.PI) / 180);
    coords.push([lon + dLon * Math.sin(angle), lat + dLat * Math.cos(angle)]);
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [coords] },
        properties: {},
      },
    ],
  };
}

export default function AddressScreen() {
  const token = useAuthStore((s) => s.token);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const { addAddress, setSkipped } = useAddressStore();

  const bannerAnim = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [pinAddress, setPinAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const { mutate: saveToServer } = useSaveUserAddress();

  const { deliveryAvailable, zones, zonesLoading } = useDeliveryZone({
    latitude: region.latitude,
    longitude: region.longitude,
    startWatcher: true,
  });

  useEffect(() => {
    Animated.spring(bannerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [deliveryAvailable]);

  useEffect(() => {
    (async () => {
      const coords = await getCurrentCoords();
      if (!coords) return;
      setRegion(coords);
      cameraRef.current?.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 14,
        duration: 1000,
      });
      const addr = await reverseGeocode(coords.latitude, coords.longitude);
      setPinAddress(addr);
    })();
  }, [isMapReady]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        const results = await searchLocations(query);
        setSuggestions(results);
        setLoading(false);
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleMapReady = useCallback(() => setIsMapReady(true), []);

  const handleRegionDidChange = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (!mapRef.current) return;
      try {
        const center = await mapRef.current.getCenter();
        const coords = { latitude: center[1], longitude: center[0] };
        setRegion(coords);
        const addr = await reverseGeocode(coords.latitude, coords.longitude);
        setPinAddress(addr);
      } catch (error) {
        console.error(error);
      }
    }, 900);
  }, []);

  const handleSelectSuggestion = useCallback((item: any) => {
    const coords = { latitude: item.lat, longitude: item.lon };
    setRegion(coords);
    setPinAddress(item.name);
    setQuery(item.name);
    setSuggestions([]);
    setIsSearching(false);
    cameraRef.current?.flyTo({
      center: [item.lon, item.lat],
      zoom: 14,
      duration: 800,
    });
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    const coords = await getCurrentCoords();
    if (!coords) return;
    setRegion(coords);
    cameraRef.current?.flyTo({
      center: [coords.longitude, coords.latitude],
      zoom: 14,
      duration: 800,
    });
    const addr = await reverseGeocode(coords.latitude, coords.longitude);
    setPinAddress(addr);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!pinAddress) return;
    if (token) {
      saveToServer({
        title: "Home",
        name: "Home",
        address_name: pinAddress,
        latitude: String(region.latitude),
        longitude: String(region.longitude),
        type: "home",
        other_address_name: "",
      });
    } else {
      addAddress({
        label: "Home",
        address: pinAddress,
        latitude: region.latitude,
        longitude: region.longitude,
        isDefault: true,
        deliveryAvailable,
      });
    }
    router.replace("/(app)/(tabs)/(home)");
  }, [pinAddress, region, addAddress, deliveryAvailable]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center px-4 pt-2 pb-3 bg-white border-b border-gray-100 z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-[15px] text-gray-900 py-0"
            placeholder="Search area, street, landmark..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="p-1"
            >
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            setSkipped(true);
            router.replace("/(app)/(tabs)/(home)");
          }}
          className="ml-3 px-3 py-2"
        >
          <Text className="text-sm text-gray-400 font-medium">Skip</Text>
        </TouchableOpacity>
      </View>

      {isSearching && suggestions.length > 0 && (
        <View className="absolute top-17.5 left-4 right-4 bg-white rounded-xl max-h-[250px] z-20 shadow-lg">
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center px-4 py-3.5 border-b border-gray-100 gap-3"
                onPress={() => handleSelectSuggestion(item)}
              >
                <MapPin size={16} color="#D7A11B" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-900" numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      {isSearching && loading && (
        <View className="absolute top-17.5 left-0 right-0 items-center z-20">
          <ActivityIndicator color="#D7A11B" />
        </View>
      )}

      <View className="flex-1 relative">
        <Map
          ref={mapRef}
          className="flex-1"
          mapStyle={MAP_STYLE}
          onDidFinishLoadingMap={handleMapReady}
          onRegionIsChanging={handleRegionDidChange}
        >
          <Camera
            ref={cameraRef}
            center={[region.longitude, region.latitude]}
          />

          {zones.map((zone, i) => (
            <GeoJSONSource
              key={`zone-source-${i}`}
              id={`zone-source-${i}`}
              data={buildCircleGeoJSON(
                zone.latitude,
                zone.longitude,
                zone.radius,
              )}
            >
              <Layer
                id={`zone-fill-${i}`}
                type="fill"
                paint={{
                  "fill-color": "#D7A11B",
                  "fill-opacity": 0.1,
                }}
              />
              <Layer
                id={`zone-line-${i}`}
                type="line"
                paint={{
                  "line-color": "#D7A11B",
                  "line-width": 2,
                  "line-dasharray": [4, 3],
                  "line-opacity": 0.8,
                }}
              />
            </GeoJSONSource>
          ))}
        </Map>

        <View
          className="absolute inset-0 justify-center items-center"
          pointerEvents="none"
        >
          <View className="items-center mb-10">
            <MapPin
              size={40}
              color={deliveryAvailable ? "#16A34A" : "#EF4444"}
              fill="white"
            />
            <View
              className={`w-2 h-2 rounded-full -mt-1 ${
                deliveryAvailable ? "bg-green-600" : "bg-red-500"
              }`}
            />
          </View>
        </View>

        {!zonesLoading && pinAddress ? (
          <Animated.View
            style={{
              opacity: bannerAnim,
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
            className={`absolute top-3 left-4 right-4 flex-row items-center gap-2 px-4 py-2.5 rounded-xl shadow-md ${
              deliveryAvailable
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
            pointerEvents="none"
          >
            {deliveryAvailable ? (
              <CheckCircle2 size={18} color="#16A34A" />
            ) : (
              <AlertCircle size={18} color="#EF4444" />
            )}
            <Text
              className={`text-sm font-semibold flex-1 ${
                deliveryAvailable ? "text-green-700" : "text-red-600"
              }`}
            >
              {deliveryAvailable
                ? "Delivery available here"
                : "Outside delivery zone"}
            </Text>
          </Animated.View>
        ) : null}

        <TouchableOpacity
          className="absolute right-4 bottom-5 bg-white p-3 rounded-xl shadow-md"
          onPress={handleUseCurrentLocation}
        >
          <Navigation size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-5 pt-5 pb-8 rounded-t-[20px] shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        <View className="flex-row items-start gap-3 mb-3">
          <Crosshair size={20} color="#D7A11B" className="mt-0.5" />
          <View className="flex-1">
            <Text className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Selected Location
            </Text>
            <Text className="text-[15px] text-gray-900">
              {pinAddress || "Move map to select location..."}
            </Text>
          </View>
        </View>

        {pinAddress && !zonesLoading && (
          <View
            className={`flex-row items-center gap-2 px-3 py-2 rounded-lg mb-3 ${
              deliveryAvailable ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {deliveryAvailable ? (
              <CheckCircle2 size={15} color="#16A34A" />
            ) : (
              <AlertCircle size={15} color="#EF4444" />
            )}
            <Text
              className={`text-xs font-medium flex-1 ${
                deliveryAvailable ? "text-green-700" : "text-red-600"
              }`}
            >
              {deliveryAvailable
                ? "This location is within our delivery zone"
                : "We don't deliver to this location yet"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className={`py-2.5 rounded-md items-center ${
            pinAddress && deliveryAvailable
              ? "bg-yellow"
              : pinAddress && !deliveryAvailable
                ? "bg-gray-300"
                : "bg-gray-200"
          }`}
          onPress={handleConfirm}
          disabled={!pinAddress}
        >
          <Text
            className={`text-base font-semibold ${
              pinAddress && deliveryAvailable ? "text-white" : "text-gray-500"
            }`}
          >
            {!pinAddress
              ? "Select a location"
              : deliveryAvailable
                ? "Confirm Location"
                : "Save Anyway (No Delivery)"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
