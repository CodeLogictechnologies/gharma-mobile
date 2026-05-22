import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useEffect, useState } from "react";

const GEOFENCING_TASK = "GEOFENCING_TASK";

const geofences = [
  {
    identifier: "Thamel",
    latitude: 27.7172,
    longitude: 85.324,
    radius: 300,
    name: "Thamel",
  },
  {
    identifier: "Patan_Durbar_Square",
    latitude: 27.6733,
    longitude: 85.3245,
    radius: 400,
    name: "Patan Durbar Square",
  },
  {
    identifier: "Swayambhunath_Stupa",
    latitude: 27.7146,
    longitude: 85.29,
    radius: 350,
    name: "Swayambhunath Stupa",
  },
  {
    identifier: "Boudhanath_Stupa",
    latitude: 27.7215,
    longitude: 85.362,
    radius: 400,
    name: "Boudhanath Stupa",
  },
  {
    identifier: "Pashupatinath_Temple",
    latitude: 27.7105,
    longitude: 85.3486,
    radius: 350,
    name: "Pashupatinath Temple",
  },
];

TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Geofencing task error:", error);
    return;
  }

  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  const geofence = geofences.find((g) => g.identifier === region.identifier);
  if (!geofence) return;

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log(`✅ Entered region: ${geofence.name}`);
    // Here you can update global state, trigger a notification, etc.
    // For example, you might want to update a global Zustand store
    // useGeofencingStore.getState().setCurrentRegion(geofence.name);
  } else if (eventType === Location.GeofencingEventType.Exit) {
    console.log(`❌ Exited region: ${geofence.name}`);
    // Here you can clear the current region in your global state
    // useGeofencingStore.getState().setCurrentRegion(null);
  }
});

export const useGeofencing = () => {
  const [isGeofencingStarted, setIsGeofencingStarted] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);

  // Check for background location permission (required for geofencing)
  const checkBackgroundPermission = async () => {
    const { status } = await Location.getBackgroundPermissionsAsync();
    const granted = status === "granted";
    setHasBackgroundPermission(granted);
    return granted;
  };

  // Request background location permission
  const requestBackgroundPermission = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    const granted = status === "granted";
    setHasBackgroundPermission(granted);
    return granted;
  };

  // Start geofencing
  const startGeofencing = async () => {
    // Ensure background permission is granted
    let permissionGranted = hasBackgroundPermission;
    if (!permissionGranted) {
      permissionGranted = await requestBackgroundPermission();
    }

    if (!permissionGranted) {
      console.error("Background location permission not granted");
      return;
    }

    // Check if geofencing is already started
    const isStarted = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK);
    if (isStarted) {
      console.log("Geofencing already started");
      setIsGeofencingStarted(true);
      return;
    }

    // Start geofencing with the defined regions
    await Location.startGeofencingAsync(GEOFENCING_TASK, geofences);
    setIsGeofencingStarted(true);
    console.log("Geofencing started successfully");
  };

  // Stop geofencing
  const stopGeofencing = async () => {
    const isStarted = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK);
    if (isStarted) {
      await Location.stopGeofencingAsync(GEOFENCING_TASK);
      setIsGeofencingStarted(false);
      setCurrentRegion(null);
      console.log("Geofencing stopped");
    }
  };

  // On mount, check background permission and optionally start geofencing
  useEffect(() => {
    const init = async () => {
      const hasPermission = await checkBackgroundPermission();
      if (hasPermission) {
        // Auto-start geofencing if permission is already granted
        await startGeofencing();
      }
    };
    init();

    return () => {
      stopGeofencing();
    };
  }, []);

  return {
    isGeofencingStarted,
    currentRegion,
    hasBackgroundPermission,
    startGeofencing,
    stopGeofencing,
    requestBackgroundPermission,
  };
};
