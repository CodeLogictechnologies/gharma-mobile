import Cart from "@/features/cart/Cart";
import { useGuestCartStore } from "@/features/cart/store/GuestCartItem";
import { CartItem } from "@/features/cart/types";
import { useAuthStore } from "@/store/useAuth";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 56;
const MINI_HEIGHT = 80;
const SNAP_MAX = 0;
const SPRING = { damping: 55, stiffness: 300, mass: 0.85 };
const VELOCITY_THRESHOLD = 450;

const FloatingCart = ({
  data,
  onOrderSuccess,
}: {
  data: CartItem[];
  onOrderSuccess?: (data: any) => void;
}) => {
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  const guestItemCount = useGuestCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const guestTotal = useGuestCartStore((s) =>
    s.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
  );

  const itemCount = isLoggedIn ? data.length : guestItemCount;
  const total = isLoggedIn
    ? data.reduce((s, i) => s + Number(i.total_price), 0)
    : guestTotal;

  const MINI_BOTTOM = TAB_BAR_HEIGHT + insets.bottom + 8;
  const SNAP_MIN = SCREEN_HEIGHT - MINI_BOTTOM - MINI_HEIGHT;

  const translateYRef = useRef(useSharedValue(SNAP_MIN));
  const translateY = translateYRef.current;
  const startY = useSharedValue(SNAP_MIN);

  const snapToExpanded = useCallback(() => {
    translateY.value = withSpring(SNAP_MAX, SPRING);
    setIsExpanded(true);
    setIsDragging(false);
  }, [translateY]);

  const snapToMini = useCallback(() => {
    translateY.value = withSpring(SNAP_MIN, SPRING);
    setIsExpanded(false);
    setIsDragging(false);
  }, [translateY]);

  const startDragging = useCallback(() => setIsDragging(true), []);
  const stopDragging = useCallback(() => setIsDragging(false), []);

  const makePan = useCallback(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          startY.value = translateY.value;
          runOnJS(startDragging)();
        })
        .onUpdate(({ translationY }) => {
          translateY.value = Math.max(
            SNAP_MAX,
            Math.min(SNAP_MIN, startY.value + translationY),
          );
        })
        .onEnd(({ velocityY }) => {
          const flickUp = velocityY < -VELOCITY_THRESHOLD;
          const flickDown = velocityY > VELOCITY_THRESHOLD;
          const pastMid = translateY.value < SNAP_MIN * 0.5;

          if (flickUp || (!flickDown && pastMid)) runOnJS(snapToExpanded)();
          if (flickDown || (!flickUp && !pastMid)) runOnJS(snapToMini)();
        })
        .onFinalize(() => {
          if (!isExpanded) runOnJS(stopDragging)();
        }),
    [
      translateY,
      startY,
      snapToExpanded,
      snapToMini,
      startDragging,
      stopDragging,
      isExpanded,
    ],
  );

  const handleGesture = useMemo(() => makePan(), [makePan]);
  const miniBarGesture = useMemo(() => makePan(), [makePan]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const cartContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_MAX, SNAP_MIN * 0.25],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const miniBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_MIN * 0.9, SNAP_MIN],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_MAX, SNAP_MIN * 0.5],
      [0.4, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const sheetBgStyle = useAnimatedStyle(() => ({
    backgroundColor: translateY.value < SNAP_MIN ? "#fff" : "transparent",
  }));

  if (itemCount === 0) return null;

  return (
    <>
      <Animated.View
        pointerEvents={isExpanded ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            zIndex: 99,
          },
          backdropStyle,
        ]}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={snapToMini}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        pointerEvents={isExpanded || isDragging ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            backgroundColor:
              isDragging || isExpanded ? "#F4F4F4" : "transparent",
          },
          sheetStyle,
          sheetBgStyle,
        ]}
      >
        <Animated.View style={[{ flex: 1 }, cartContentStyle]}>
          <Cart
            data={data}
            handleGesture={handleGesture}
            snapToMini={snapToMini}
            onOrderSuccess={onOrderSuccess}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        pointerEvents={isExpanded ? "none" : "auto"}
        style={[
          miniBarStyle,
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: MINI_HEIGHT,
            zIndex: 101,
            backgroundColor: "transparent",
          },
        ]}
      >
        <GestureDetector gesture={miniBarGesture}>
          <TouchableOpacity
            onPress={snapToExpanded}
            activeOpacity={0.92}
            style={{
              marginHorizontal: 16,
              borderRadius: 999,
              backgroundColor: "#d7a11b",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 24,
              shadowColor: "#b5860f",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: "700",
                flex: 1,
              }}
            >
              {itemCount} Item{itemCount > 1 ? "s" : ""}
            </Text>

            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "800",
                flex: 1,
                textAlign: "center",
              }}
            >
              {isLoggedIn ? "Checkout" : "Login to order"}
            </Text>

            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: "700",
                flex: 1,
                textAlign: "right",
              }}
            >
              Rs {total}
            </Text>
          </TouchableOpacity>
        </GestureDetector>
      </Animated.View>
    </>
  );
};

export default FloatingCart;
