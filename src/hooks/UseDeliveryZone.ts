import { useGetShopAddress } from "@/screen/address/hooks";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useRef, useState } from "react";

export const DELIVERY_GEOFENCE_TASK = "DELIVERY_GEOFENCE_TASK";

export const DELIVERY_RADIUS_METERS = 5000; // 5 km

export interface DeliveryZone {
  latitude: number;
  longitude: number;
  radius: number;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isInsideDeliveryZone(
  lat: number,
  lon: number,
  zones: DeliveryZone[],
): boolean {
  return zones.some(
    (z) => haversineDistance(lat, lon, z.latitude, z.longitude) <= z.radius,
  );
}

if (!TaskManager.isTaskDefined(DELIVERY_GEOFENCE_TASK)) {
  TaskManager.defineTask(
    DELIVERY_GEOFENCE_TASK,
    ({
      data,
      error,
    }: {
      data: {
        eventType: Location.GeofencingEventType;
        region: Location.LocationRegion;
      };
      error: TaskManager.TaskManagerError | null;
    }) => {
      if (error) {
        console.warn("[Geofence Task] error:", error.message);
        return;
      }
      console.log(
        "[Geofence Task] event:",
        data.eventType,
        data.region.identifier,
      );
    },
  );
}

interface UseDeliveryZoneOptions {
  latitude: number;
  longitude: number;
  startWatcher?: boolean;
}

export function useDeliveryZone({
  latitude,
  longitude,
  startWatcher = false,
}: UseDeliveryZoneOptions) {
  const { data: shopData, isLoading: zonesLoading } = useGetShopAddress();
  const [watcherActive, setWatcherActive] = useState(false);
  const watcherStarted = useRef(false);

  const zones: DeliveryZone[] = (shopData?.data ?? [])
    .filter(
      (s) => s.coordinates.latitude != null && s.coordinates.longitude != null,
    )
    .map((s) => ({
      latitude: s.coordinates.latitude!,
      longitude: s.coordinates.longitude!,
      radius: DELIVERY_RADIUS_METERS,
    }));

  const deliveryAvailable =
    zones.length > 0 && isInsideDeliveryZone(latitude, longitude, zones);

  const startGeofenceWatcher = useCallback(async () => {
    if (zones.length === 0) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const isRunning = await Location.hasStartedGeofencingAsync(
        DELIVERY_GEOFENCE_TASK,
      );
      if (isRunning) {
        await Location.stopGeofencingAsync(DELIVERY_GEOFENCE_TASK);
      }

      const regions: Location.LocationRegion[] = zones.map((z, i) => ({
        identifier: `delivery-zone-${i}`,
        latitude: z.latitude,
        longitude: z.longitude,
        radius: z.radius,
        notifyOnEnter: true,
        notifyOnExit: true,
      }));

      await Location.startGeofencingAsync(DELIVERY_GEOFENCE_TASK, regions);
      setWatcherActive(true);
    } catch (err) {
      console.warn("[useDeliveryZone] Failed to start geofencing:", err);
    }
  }, [zones]);

  const stopGeofenceWatcher = useCallback(async () => {
    try {
      const isRunning = await Location.hasStartedGeofencingAsync(
        DELIVERY_GEOFENCE_TASK,
      );
      if (isRunning) {
        await Location.stopGeofencingAsync(DELIVERY_GEOFENCE_TASK);
      }
      setWatcherActive(false);
    } catch (err) {
      console.warn("[useDeliveryZone] Failed to stop geofencing:", err);
    }
  }, []);

  useEffect(() => {
    if (!startWatcher || watcherStarted.current || zones.length === 0) return;
    watcherStarted.current = true;
    startGeofenceWatcher();
    return () => {
      stopGeofenceWatcher();
    };
  }, [startWatcher, zones.length]);

  return {
    deliveryAvailable,
    zones,
    zonesLoading,
    watcherActive,
    startGeofenceWatcher,
    stopGeofenceWatcher,
  };
}
