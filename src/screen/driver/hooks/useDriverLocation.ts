// screen/driver/hooks/useDriverLocation.ts (unchanged from before)
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
}

const DEFAULT_LOCATION: DriverLocation = {
  latitude: 27.7,
  longitude: 85.318,
  heading: null,
  speed: null,
  accuracy: null,
};

export function useDriverLocation() {
  const [location, setLocation] = useState<DriverLocation>(DEFAULT_LOCATION);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const initLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { status: foregroundStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (!mounted) return;
        setPermissionStatus(foregroundStatus);

        if (foregroundStatus !== "granted") {
          setError("Location permission denied");
          setIsLoading(false);
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (mounted && lastKnown) {
          setLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            heading: lastKnown.coords.heading,
            speed: lastKnown.coords.speed,
            accuracy: lastKnown.coords.accuracy,
          });
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (mounted) {
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
            heading: current.coords.heading,
            speed: current.coords.speed,
            accuracy: current.coords.accuracy,
          });
          setIsLoading(false);
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (newLocation) => {
            if (mounted) {
              setLocation({
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                heading: newLocation.coords.heading,
                speed: newLocation.coords.speed,
                accuracy: newLocation.coords.accuracy,
              });
            }
          },
        );
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to get location",
          );
          setIsLoading(false);
        }
      }
    };

    initLocation();

    return () => {
      mounted = false;
      locationSubscription.current?.remove();
    };
  }, []);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
  };
}