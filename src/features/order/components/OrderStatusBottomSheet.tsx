import { request } from "@/services/api/client";
import BottomSheet, {
  BottomSheetScrollView,
} from "@expo/ui/community/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "heroui-native";
import {
  AlertCircle,
  Check,
  PackageOpen,
  RotateCw,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const BRAND = "#d7a11b";
const LINE_HEIGHT = 28;

interface TimelineStep {
  status: string;
  value: "Y" | "N";
}

interface OrderStatusResponse {
  type: string;
  current_status: string;
  timeline: TimelineStep[];
}

interface OrderStatusBottomSheetProps {
  orderMasterId: string | null;
  onClose: () => void;
}

const PulsingHalo = () => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.5 }],
    opacity: 0.45 * (1 - pulse.value),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: BRAND,
        },
        haloStyle,
      ]}
    />
  );
};

const TimelineRow = ({
  step,
  index,
  isLast,
  isCurrent,
}: {
  step: TimelineStep;
  index: number;
  isLast: boolean;
  isCurrent: boolean;
}) => {
  const done = step.value === "Y";

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(250)}
      className="flex-row"
    >
      <View className="items-center mr-4" style={{ width: 32 }}>
        <View className="items-center justify-center">
          {isCurrent && <PulsingHalo />}
          <View
            className={`items-center justify-center rounded-full ${
              done ? "bg-primary" : "bg-white border-2 border-gray-200"
            }`}
            style={
              isCurrent ? { width: 28, height: 28 } : { width: 22, height: 22 }
            }
          >
            {done && (
              <Check size={isCurrent ? 15 : 12} color="white" strokeWidth={3} />
            )}
          </View>
        </View>
        {!isLast && (
          <View
            className={done ? "bg-primary" : "bg-gray-200"}
            style={{ width: 2, height: LINE_HEIGHT, marginVertical: 2 }}
          />
        )}
      </View>

      <View
        className="flex-1 flex-row items-center gap-2"
        style={{ height: isCurrent ? 28 : 22 }}
      >
        <Text
          className={
            done
              ? "text-sm font-inter-bold text-slate-900"
              : "text-sm font-inter-regular text-gray-400"
          }
        >
          {step.status}
        </Text>
        {isCurrent && (
          <View className="bg-primary-tint border border-primary/40 rounded-full px-2 py-0.5">
            <Text className="text-[10px] font-inter-bold text-primary-dark uppercase">
              Current
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const TimelineSkeleton = () => (
  <View className="pt-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <View key={i} className="flex-row">
        <View className="items-center mr-4" style={{ width: 32 }}>
          <Skeleton
            variant="shimmer"
            style={{ width: 22, height: 22, borderRadius: 11 }}
          />
          {i < 4 && (
            <Skeleton
              variant="shimmer"
              style={{ width: 2, height: LINE_HEIGHT, marginVertical: 2 }}
            />
          )}
        </View>
        <Skeleton
          variant="shimmer"
          style={{ width: 110, height: 14, borderRadius: 6, marginTop: 4 }}
        />
      </View>
    ))}
  </View>
);

const OrderStatusBottomSheet = ({
  orderMasterId,
  onClose,
}: OrderStatusBottomSheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const isOpen = !!orderMasterId;

  const { data, isLoading, isFetching, isError, refetch } =
    useQuery<OrderStatusResponse>({
      queryKey: ["OrderStatusTimeline", orderMasterId],
      queryFn: () =>
        request<OrderStatusResponse>({
          url: `/get/customer/orderstatus/${orderMasterId}`,
          method: "GET",
        }),
      enabled: isOpen,
    });

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && isOpen) onClose();
    },
    [isOpen, onClose],
  );

  const timeline = data?.timeline ?? [];

  const currentIndex = useMemo(
    () => timeline.findIndex((s) => s.status === data?.current_status),
    [timeline, data?.current_status],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enablePanDownToClose
      enableDynamicSizing
      onChange={handleSheetChange}
      handleIndicatorStyle={{ backgroundColor: "#d1d5db", width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-5 pb-3 border-b border-gray-100">
          <Text className="text-lg font-inter-bold text-slate-900">
            Order Status
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => refetch()}
              disabled={isFetching}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`bg-gray-100 rounded-full p-2 ${isFetching ? "opacity-40" : ""}`}
            >
              <RotateCw size={16} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="bg-gray-100 rounded-full p-2"
            >
              <X size={16} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {orderMasterId && (
          <View className="flex-row items-center justify-between px-5 pt-3 pb-1">
            <Text className="text-xs text-gray-400 font-medium">
              Order #{orderMasterId.slice(0, 8).toUpperCase()}
            </Text>
            {data?.current_status ? (
              <View className="bg-primary rounded-full px-3 py-1">
                <Text className="text-xs font-inter-bold text-white">
                  {data.current_status}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View className="px-5 pt-4">
          {isLoading ? (
            <TimelineSkeleton />
          ) : isError ? (
            <View className="items-center py-6">
              <AlertCircle size={32} color="#EF4444" />
              <Text className="text-sm font-inter-semibold text-gray-700 mt-3">
                Couldn’t load order status
              </Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">
                Something went wrong. Please try again.
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                activeOpacity={0.8}
                className="bg-primary px-6 py-2.5 rounded-xl mt-4 shadow-sm"
              >
                <Text className="text-white text-sm font-inter-bold">
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : timeline.length === 0 ? (
            <View className="items-center py-6">
              <View className="w-16 h-16 rounded-full bg-primary-tint items-center justify-center mb-3">
                <PackageOpen size={28} color={BRAND} strokeWidth={1.8} />
              </View>
              <Text className="text-sm font-inter-semibold text-gray-700">
                No status updates yet
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Check back soon — we’ll track it here
              </Text>
            </View>
          ) : (
            timeline.map((step, index) => (
              <TimelineRow
                key={`${step.status}-${index}`}
                step={step}
                index={index}
                isLast={index === timeline.length - 1}
                isCurrent={index === currentIndex}
              />
            ))
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default OrderStatusBottomSheet;
