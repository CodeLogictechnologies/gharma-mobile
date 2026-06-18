import { useDriverOrderList } from "@/screen/driver/hooks";
import { DeliveryGroup, Order, SelectedOrdersMap } from "@/screen/driver/types";
import { router } from "expo-router";
import { Checkbox } from "heroui-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type StatusTab = "pending" | "complete";

const STATUS_TABS: { label: string; value: StatusTab }[] = [
  { label: "Pending", value: "pending" },
  { label: "Complete", value: "complete" },
];

const DriverHomeScreen = () => {
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>("pending");
  const [selectedOrders, setSelectedOrders] = useState<SelectedOrdersMap>({});
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {},
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useDriverOrderList(activeStatusTab);

  const deliveryGroups: DeliveryGroup[] =
    data?.pages.flatMap((page) => page.result?.data ?? []) ?? [];

  // Get array of selected order IDs
  const selectedOrderIds = useMemo(
    () =>
      Object.entries(selectedOrders)
        .filter(([_, v]) => v)
        .map(([k]) => k),
    [selectedOrders],
  );

  // Toggle expand/collapse date section
  const toggleDateExpanded = useCallback((date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  }, []);

  // Check if all orders in a date group are selected
  const isDateFullySelected = useCallback(
    (group: DeliveryGroup): boolean => {
      if (group.orders.length === 0) return false;
      return group.orders.every((order) => selectedOrders[order.order_id]);
    },
    [selectedOrders],
  );

  // Check if some (but not all) orders in a date group are selected
  const isDatePartiallySelected = useCallback(
    (group: DeliveryGroup): boolean => {
      const selectedCount = group.orders.filter(
        (order) => selectedOrders[order.order_id],
      ).length;
      return selectedCount > 0 && selectedCount < group.orders.length;
    },
    [selectedOrders],
  );

  // Toggle all orders in a date group
  const toggleDateSelection = useCallback(
    (group: DeliveryGroup, selected: boolean) => {
      setSelectedOrders((prev) => {
        const next = { ...prev };
        group.orders.forEach((order) => {
          next[order.order_id] = selected;
        });
        return next;
      });
    },
    [],
  );

  // Toggle individual order selection
  const toggleOrderSelection = useCallback(
    (orderId: string, selected: boolean) => {
      setSelectedOrders((prev) => ({
        ...prev,
        [orderId]: selected,
      }));
    },
    [],
  );

  // Clear selections when tab changes
  const handleTabChange = useCallback((tab: StatusTab) => {
    setActiveStatusTab(tab);
    setSelectedOrders({});
    setExpandedDates({});
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScroll = useCallback(
    (event: { nativeEvent: NativeScrollEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
      if (isCloseToBottom) handleLoadMore();
    },
    [handleLoadMore],
  );

  // Navigate to map with selected order IDs
  const handleNavigateToMap = useCallback(() => {
    if (selectedOrderIds.length === 0) return;

    router.navigate({
      pathname: "/(driver)/drivermap",
      params: {
        orderids: selectedOrderIds.join(","),
      },
    });
  }, [selectedOrderIds]);

  const renderOrderItem = (order: Order) => {
    const isSelected = !!selectedOrders[order.order_id];

    return (
      <View
        key={order.order_id}
        className="flex-row items-center px-5 py-3 border-b border-secondary/50"
      >
        <Checkbox
          isSelected={isSelected}
          onSelectedChange={(selected) =>
            toggleOrderSelection(order.order_id, selected)
          }
          className="mr-3"
        />
        <View className="flex-1 flex-row items-center justify-between">
          <View className="flex-1 pr-4 space-y-1">
            <View className="flex-row items-center space-x-2">
              <Text className="text-sm font-inter-bold text-black">
                {order.order_id.slice(0, 8).toUpperCase()}
              </Text>
              <Text className="text-secondary text-xs">|</Text>
              <Text className="text-x text-gray font-inter-regular truncate max-w-[150px]">
                {order.customer_name}
              </Text>
            </View>

            <Text
              className="text-x text-gray font-inter-regular leading-4"
              numberOfLines={1}
            >
              {order.address_name}
            </Text>

            <Text className="text-xxs text-gray font-inter-light tracking-wide">
              {order.phone}
            </Text>
          </View>

          <View className="items-end space-y-1">
            <Text className="text-sm font-inter-bold text-black tracking-tight">
              Rs. {parseFloat(order.total_price).toLocaleString()}
            </Text>
            <Text
              className={`text-x tracking-wide uppercase font-inter-semibold ${
                order.order_status === "Delivered"
                  ? "text-green"
                  : order.order_status === "Pending"
                    ? "text-yellow"
                    : order.order_status === "Dispatched"
                      ? "text-primary"
                      : order.order_status === "Cancelled"
                        ? "text-red"
                        : "text-gray"
              }`}
            >
              {order.order_status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDateGroup = (group: DeliveryGroup, index: number) => {
    const isExpanded = expandedDates[group.delivery_date] ?? true;
    const isFullySelected = isDateFullySelected(group);
    const isPartiallySelected = isDatePartiallySelected(group);

    return (
      <View
        key={group.delivery_date}
        className={`${index !== deliveryGroups.length - 1 ? "mb-2" : ""}`}
      >
        {/* Date Header with Checkbox */}
        <View className="bg-secondary/30 px-5 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Checkbox
              isSelected={isFullySelected}
              onSelectedChange={(selected) =>
                toggleDateSelection(group, selected)
              }
              className="mr-3"
            />
            <TouchableOpacity
              onPress={() => toggleDateExpanded(group.delivery_date)}
              activeOpacity={0.7}
              className="flex-row items-center flex-1"
            >
              <Text className="text-sm font-inter-bold text-black">
                {new Date(group.delivery_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text className="text-x text-gray font-inter-regular ml-2">
                ({group.orders.length} order{group.orders.length > 1 ? "s" : ""}
                )
              </Text>
              <Text className="text-gray ml-2 text-lg">
                {isExpanded ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders List */}
        {isExpanded && (
          <View>{group.orders.map((order) => renderOrderItem(order))}</View>
        )}
      </View>
    );
  };

  // Get total selected count
  const selectedCount = useMemo(
    () => Object.values(selectedOrders).filter(Boolean).length,
    [selectedOrders],
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pb-3 bg-white pt-2">
        <Text className="text-2xl font-inter-bold text-black tracking-tight">
          Deliveries
        </Text>
        <Text className="text-xxs text-gray font-inter-regular mt-0.5">
          Select orders to manage deliveries
        </Text>
      </View>

      {/* Status Tabs: Pending / Complete */}
      <View className="px-5 pb-3 bg-white">
        <View className="flex-row bg-secondary rounded-lg p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatusTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => handleTabChange(tab.value)}
                className={`flex-1 py-2.5 rounded-md items-center ${
                  isActive ? "bg-white shadow-sm" : ""
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-sm ${
                    isActive
                      ? "text-black font-inter-semibold"
                      : "text-gray font-inter-regular"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Count Bar + Navigate Button */}
      {selectedCount > 0 && (
        <View className="px-5 py-2 bg-yellow/20 border-y border-yellow flex-row items-center justify-between">
          <Text className="text-sm font-inter-semibold text-black">
            {selectedCount} order{selectedCount > 1 ? "s" : ""} selected
          </Text>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => setSelectedOrders({})}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-inter-semibold text-red">
                Clear
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNavigateToMap}
              activeOpacity={0.8}
              className="bg-yellow px-4 py-1.5 rounded-md"
            >
              <Text className="text-sm font-inter-semibold text-black">
                View Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {isLoading && !data ? (
          <View className="items-center justify-center py-24">
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text className="text-gray font-inter-regular text-x mt-3">
              Loading orders...
            </Text>
          </View>
        ) : isError ? (
          <View className="items-center justify-center py-24 px-8">
            <Text className="text-red font-inter-semibold text-lg mb-2">
              Failed to load orders
            </Text>
            <Text className="text-gray font-inter-regular text-x text-center mb-4">
              {error?.message || "Something went wrong. Please try again."}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-yellow px-6 py-3 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-black font-inter-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : deliveryGroups.length > 0 ? (
          <>
            {deliveryGroups.map((group, index) =>
              renderDateGroup(group, index),
            )}
            {isFetchingNextPage && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#F59E0B" />
              </View>
            )}
          </>
        ) : (
          <View className="items-center justify-center py-24">
            <Text className="text-gray font-inter-regular text-x">
              No {activeStatusTab} orders found
            </Text>
          </View>
        )}

        <View className="h-12" />
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          router.navigate("/(app)/(tabs)/(home)");
        }}
      >
        <Text>Main</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DriverHomeScreen;
