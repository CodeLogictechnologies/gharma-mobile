import { Animated as MapAnimated } from "@maplibre/maplibre-react-native";
import React, { memo, useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

/** Initial bearing (degrees, 0 = north) of the from → to segment. */
export const bearingBetween = (
  from: [number, number],
  to: [number, number],
): number => {
  const [lng1, lat1] = from.map((d) => (d * Math.PI) / 180);
  const [lng2, lat2] = to.map((d) => (d * Math.PI) / 180);
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

/** Approximate distance in meters between two lngLat points. */
export const distanceMeters = (
  from: [number, number],
  to: [number, number],
): number => {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(to[1] - from[1]);
  const dLng = toRad(to[0] - from[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from[1])) * Math.cos(toRad(to[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface SmoothMarkerProps {
  id: string;
  /** Target position; the marker glides here from wherever it currently is. */
  coordinate: [number, number];
  /** Glide duration — match the update cadence for continuous motion. */
  durationMs?: number;
  /**
   * Explicit heading in degrees (e.g. GPS course). When omitted and
   * `rotateToMovement` is set, the bearing is derived from movement.
   */
  bearing?: number | null;
  /** Derive rotation from the direction of travel between updates. */
  rotateToMovement?: boolean;
  anchor?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  children: React.ReactNode;
}

/** Movement below this is GPS noise — don't animate or derive bearing. */
const MIN_MOVE_METERS = 2;

/**
 * Map marker that glides between position updates instead of teleporting.
 * Position and rotation are driven by `Animated` values attached to the
 * native marker props, so nothing re-renders per frame. A new update
 * mid-animation retargets from the current interpolated position — no
 * restart glitch.
 */
const SmoothMarker = ({
  id,
  coordinate,
  durationMs = 1_000,
  bearing = null,
  rotateToMovement = false,
  anchor = "center",
  children,
}: SmoothMarkerProps) => {
  const lng = useRef(new Animated.Value(coordinate[0])).current;
  const lat = useRef(new Animated.Value(coordinate[1])).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const prevCoordinate = useRef<[number, number]>(coordinate);
  /** Unwrapped rotation target so 350° → 10° turns +20°, not −340°. */
  const rotationTarget = useRef(0);
  const isFirstUpdate = useRef(true);

  useEffect(() => {
    const [toLng, toLat] = coordinate;
    const from = prevCoordinate.current;
    const moved = distanceMeters(from, coordinate);

    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      prevCoordinate.current = coordinate;
      lng.setValue(toLng);
      lat.setValue(toLat);
      if (bearing != null) {
        rotationTarget.current = bearing;
        rotation.setValue(bearing);
      }
      return;
    }

    if (moved < MIN_MOVE_METERS && bearing == null) return;

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(lng, {
        toValue: toLng,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(lat, {
        toValue: toLat,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ];

    const nextBearing =
      bearing != null
        ? bearing
        : rotateToMovement && moved >= MIN_MOVE_METERS
          ? bearingBetween(from, coordinate)
          : null;

    if (nextBearing != null) {
      const current = rotationTarget.current;
      const delta = ((nextBearing - (current % 360) + 540) % 360) - 180;
      rotationTarget.current = current + delta;

      animations.push(
        Animated.timing(rotation, {
          toValue: rotationTarget.current,
          duration: Math.min(durationMs, 600),
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      );
    }

    prevCoordinate.current = coordinate;
    Animated.parallel(animations).start();
  }, [coordinate[0], coordinate[1], bearing, durationMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <MapAnimated.Marker
      id={id}
      anchor={anchor}
      lngLat={[lng, lat] as unknown as [number, number]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        {children}
      </Animated.View>
    </MapAnimated.Marker>
  );
};

export default memo(SmoothMarker);
