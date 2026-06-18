import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Truck,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OrderCardSkeleton from "./component/skeleton/OrderCardSkeleton";
import { useOrderHistoryList } from "./hooks";
import { OrderItem } from "./types";

const Order = () => {
  const tabs = [
    "All",
    "To Pay",
    "To Ship",
    "To Receive",
    "To Review",
    "Returns",
  ];

  const token = useAuthStore((s) => s.token);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useOrderHistoryList();

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: OrderItem; index: number }) => (
      <OrderCard item={item} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: OrderItem, index: number) => `${item.productname}-${index}`,
    [],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View className="border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2"
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity key={tab} className="mr-6 pb-2 items-center">
              <Text
                className={`text-sm ${index === 0 ? "text-primary font-bold" : "text-gray-500"}`}
              >
                {tab}
              </Text>
              {tab === "To Pay" && (
                <View className="absolute -top-1 -right-3 bg-primary rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-[10px]">1</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ),
    [],
  );

  const ListFooterComponent = useCallback(
    () =>
      isFetchingNextPage ? (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#F97316" />
        </View>
      ) : null,
    [isFetchingNextPage],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View className="flex-1 items-center justify-center px-8 py-20">
        <Store size={64} color="#d1d5db" strokeWidth={1.5} />
        <Text className="text-lg font-bold text-gray-400 mt-4 text-center">
          No Orders Found
        </Text>
      </View>
    ),
    [],
  );

  if (!token) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle={"dark-content"} />

        <View className="flex-row items-center px-4 py-3">
          <Text className="text-lg font-bold ml-3 ">My Orders</Text>
          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-xl border border-primary/50 flex-1 mx-2">
            <Search size={18} color="#6b7280" strokeWidth={2} />
            <TextInput
              placeholder="Search..."
              className="ml-2 flex-1 text-sm"
            />
          </View>
          <TouchableOpacity>
            <SlidersHorizontal size={20} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Store size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text className="text-lg font-bold text-gray-400 mt-4 text-center">
            No Orders Found
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            Please log in to view your orders
          </Text>
          <TouchableOpacity
            onPress={() => router.navigate("/login")}
            className="mt-6 bg-primary px-8 py-3 rounded-md"
          >
            <Text className="text-white font-bold text-sm">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isPending) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle={"dark-content"} />

        <View className="flex-row items-center px-4 py-3">
          <Text className="text-lg font-bold ml-3 ">My Orders</Text>
          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-xl border border-primary/50 flex-1 mx-2">
            <Search size={18} color="#6b7280" strokeWidth={2} />
            <TextInput
              placeholder="Search..."
              className="ml-2 flex-1 text-sm"
            />
          </View>
          <TouchableOpacity>
            <SlidersHorizontal size={20} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <View className="flex-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <OrderCardSkeleton key={idx} />
              ))}
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle={"dark-content"} />
      <View className="bg-white p-4 flex-row justify-between items-center border-gray-200">
        <TouchableOpacity onPress={() => {}} className="p-1">
          <ArrowLeft size={20} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">My Orders</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => {
              router.navigate("/(app)/cartlist");
            }}
          >
            <ShoppingCart size={22} />
          </TouchableOpacity>
          <Search size={22} />
        </View>
      </View>
      <View className="flex-row items-center px-4">
        <View className="flex-row items-center bg-gray-100 px-3 py-0 rounded-xl border border-primary/50 flex-1 mx-2">
          <Search size={18} color="#6b7280" strokeWidth={2} />
          <TextInput placeholder="Search..." className="ml-2 flex-1 text-sm" />
        </View>
        <TouchableOpacity>
          <SlidersHorizontal size={20} color="#4b5563" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const OrderCard = React.memo(({ item }: { item: OrderItem }) => {
  const isDelivered = item.order_status === "Delivered";
  const statusColor = isDelivered ? "text-green-500" : "text-orange-500";
  const actionLabel = isDelivered ? "Buy Again" : "Pay Now";

  return (
    <View className="mt-2 p-4">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="w-6 h-6 bg-red-50 items-center justify-center rounded-full mr-2">
            <Store size={14} color="#ef4444" />
          </View>
          <Text className="font-bold text-gray-800">Ram's Clothing Store</Text>
          <ChevronRight size={16} color="#9ca3af" strokeWidth={2.5} />
        </View>
        <Text className={`font-medium ${statusColor}`}>
          {item.order_status}
        </Text>
      </View>

      {item.time && (
        <TouchableOpacity
          onPress={() => {
            router.navigate({
              pathname: "/deliverymap",
              params: {
                orderId: item?.orderid,
              },
            });
          }}
          className="flex-row items-center bg-blue-50 p-2 rounded-md mb-3 justify-between"
        >
          <View className="flex-row items-center">
            <Truck size={16} color="#3b82f6" strokeWidth={2} />
            <Text className="text-xs text-blue-600 ml-2">
              Delivered on {item.time.split(" ")[0]}
            </Text>
          </View>
          <ChevronRight size={14} color="#3b82f6" />
        </TouchableOpacity>
      )}

      <View className="flex-row">
        <Image
          source={{ uri: item.image }}
          className="w-20 h-20 rounded-md bg-gray-50 border border-gray-100"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
            {item.productname}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Variation: {item.variation}
          </Text>
          <Text className="text-primary font-bold mt-1">Rs. {item.price}</Text>
        </View>
        <Text className="font-bold text-sm self-end text-gray-600">
          Qty: {item.quantity}
        </Text>
      </View>

      <View className="items-end mt-4 border-t border-gray-100 pt-3">
        <Text className="text-xs text-gray-500">
          Total({item.quantity} items):
          <Text className="font-bold text-gray-900">
            Rs. {(item.price * item.quantity).toLocaleString()}
          </Text>
        </Text>
        <View className="flex-row mt-3">
          <TouchableOpacity className="border border-gray-300 px-4 py-2 rounded-md mr-2">
            <Text className="text-gray-600 text-xs">Return/Refund</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary px-6 py-2 rounded-md">
            <Text className="text-white text-xs font-bold">{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default Order;
