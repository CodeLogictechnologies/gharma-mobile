import Cart from "@/screen/cart/Cart";
import { useGuestCartStore } from "@/screen/cart/store/GuestCartItem";
import { CartItem } from "@/screen/cart/types";
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
const TAB_BAR_HEIGHT = 60;
const MINI_HEIGHT = 80;
const EXTRA_BOTTOM_SPACING = 16;
const SNAP_MAX = 0;
const SPRING = { damping: 55, stiffness: 300, mass: 0.85 };
const VELOCITY_THRESHOLD = 450;

const FloatingCart = ({ data }: { data: CartItem[] }) => {
  const insets = useSafeAreaInsets();
  const bottomSafe = insets.bottom;
  const [isExpanded, setIsExpanded] = useState(false);

  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  // Reactive guest cart values — re-renders when items change
  const guestItemCount = useGuestCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const guestTotal = useGuestCartStore((s) =>
    s.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
  );

  // Use API data for auth users, guest store for guests
  const itemCount = isLoggedIn ? data.length : guestItemCount;
  const total = isLoggedIn
    ? data.reduce((s, i) => s + Number(i.total_price), 0)
    : guestTotal;

  // Don't render the floating bar if the cart is empty
  if (itemCount === 0) return null;

  const SNAP_MIN =
    SCREEN_HEIGHT -
    TAB_BAR_HEIGHT -
    EXTRA_BOTTOM_SPACING -
    (MINI_HEIGHT + 10) -
    bottomSafe;

  const translateYRef = useRef(useSharedValue(SNAP_MIN));
  const translateY = translateYRef.current;
  const startY = useSharedValue(SNAP_MIN);

  const snapToExpanded = useCallback(() => {
    translateY.value = withSpring(SNAP_MAX, SPRING);
    setIsExpanded(true);
  }, [translateY]);

  const snapToMini = useCallback(() => {
    translateY.value = withSpring(SNAP_MIN, SPRING);
    setIsExpanded(false);
  }, [translateY]);

  const makePan = useCallback(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          startY.value = translateY.value;
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
        }),
    [translateY, startY, snapToExpanded, snapToMini],
  );

  const handleGesture = useMemo(() => makePan(), [makePan]);
  const miniBarGesture = useMemo(() => makePan(), [makePan]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const fullCartStyle = useAnimatedStyle(() => ({
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
      [SNAP_MIN * 0.75, SNAP_MIN],
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
            bottom: TAB_BAR_HEIGHT + bottomSafe,
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
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          },
          sheetStyle,
          sheetBgStyle,
        ]}
      >
        {/* Mini bar */}
        <Animated.View
          pointerEvents={isExpanded ? "none" : "auto"}
          style={[
            miniBarStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: MINI_HEIGHT + 10,
              zIndex: 2,
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
                marginTop: 10,
                borderRadius: 50,
                backgroundColor: "#D4A017",
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 28,
                shadowColor: "#C49A10",
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
                  fontSize: 16,
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

        {/* Full cart sheet */}
        <Animated.View
          pointerEvents={isExpanded ? "auto" : "none"}
          style={[
            fullCartStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#F4F4F4",
            },
          ]}
        >
          <Cart
            data={data}
            handleGesture={handleGesture}
            snapToMini={snapToMini}
          />
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default FloatingCart;
