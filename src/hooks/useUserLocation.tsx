import * as Location from "expo-location";
import { LocationAccuracy, LocationObject } from "expo-location";
import { useCallback, useEffect, useState } from "react";

interface UseUserLocationOptions {
  autoFetch?: boolean;
  accuracy?: LocationAccuracy;
  showAlertOnError?: boolean;
}

interface UseUserLocationReturn {
  location: LocationObject | null;
  errorMsg: string | null;
  loading: boolean;
  hasPermission: boolean;
  fetchLocation: () => Promise<void>;
  requestPermission: () => Promise<void>;
}

export const useUserLocation = (
  options: UseUserLocationOptions = {},
): UseUserLocationReturn => {
  const {
    autoFetch = true,
    accuracy = LocationAccuracy.Balanced,
    showAlertOnError = false,
  } = options;

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const requestPermission = useCallback(async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);

      if (!granted && showAlertOnError) {
        alert("Location permission denied");
        setErrorMsg("Permission to access location was denied");
      }
      return granted;
    } catch (error) {
      console.error("Permission error:", error);
      setErrorMsg("Failed to request location permission");
      if (showAlertOnError) alert("Failed to request location permission");
    }
  }, [showAlertOnError]);

  const fetchLocation = useCallback(async (): Promise<void> => {
    let permissionGranted = hasPermission;
    if (!permissionGranted) {
      await requestPermission();
      permissionGranted = hasPermission;
    }

    if (!permissionGranted) {
      setErrorMsg("Location permission not granted");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
      });
      setLocation(currentLocation);
      setErrorMsg(null);
    } catch (error: any) {
      console.error("Location fetch error:", error);
      let message = "Failed to get location";
      if (error.message?.includes("LOCATION_UNAVAILABLE")) {
        message = "Location services are disabled. Please enable them.";
      } else if (error.message?.includes("TIMEOUT")) {
        message = "Location request timed out. Please try again.";
      }
      setErrorMsg(message);
      if (showAlertOnError) alert(message);
    } finally {
      setLoading(false);
    }
  }, [hasPermission, accuracy, showAlertOnError, requestPermission]);

  useEffect(() => {
    const init = async () => {
      await requestPermission();
      if (autoFetch && hasPermission) {
        await fetchLocation();
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (autoFetch && hasPermission && !location && !loading) {
      fetchLocation();
    }
  }, [hasPermission, autoFetch, location, loading, fetchLocation]);

  return {
    location,
    errorMsg,
    loading,
    hasPermission,
    fetchLocation,
    requestPermission,
  };
};
