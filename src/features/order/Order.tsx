import { useAddtoCart } from "@/features/cart/hooks";
import { useAuthStore } from "@/store/useAuth";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  ShoppingCart,
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
  TouchableOpacity,
  View,
} from "react-native";
import OrderStatusBottomSheet from "./components/OrderStatusBottomSheet";
import OrderCardSkeleton from "./components/skeleton/OrderCardSkeleton";
import { useOrderHistoryList } from "./hooks";
import { OrderItem } from "./types";

const TABS = [
  "All",
  "To Pay",
  "To Ship",
  "To Receive",
  "To Review",
  "Returns",
] as const;

const TAB_BADGES: Record<string, number> = {
  "To Pay": 1,
};

const Header = ({
  showBack,
  onCartPress,
}: {
  showBack?: boolean;
  onCartPress?: () => void;
}) => (
  <View className="bg-white p-4 flex-row justify-between items-center border-b border-slate-100">
    {showBack ? (
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="p-1"
      >
        <ArrowLeft size={20} color="#0f172a" />
      </TouchableOpacity>
    ) : (
      <View className="p-1" />
    )}
    <Text className="text-lg font-inter-bold text-slate-900">My Orders</Text>
    <View className="flex-row gap-4">
      <TouchableOpacity
        onPress={onCartPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ShoppingCart size={22} color="#0f172a" />
      </TouchableOpacity>
      {/* <Search size={22} /> */}
    </View>
  </View>
);

const SearchBar = () => (
  <>
    {/* <View className="flex-row items-center px-4 py-2">
      <View className="flex-row items-center bg-gray-100 px-3 py-0 rounded-xl border border-primary/50 flex-1 mx-2">
        <Search size={18} color="#6b7280" strokeWidth={2} />
        <TextInput placeholder="Search..." className="ml-2 flex-1 text-sm" />
      </View>
      <TouchableOpacity>
        <SlidersHorizontal size={20} color="#4b5563" strokeWidth={2} />
      </TouchableOpacity>
    </View> */}
  </>
);

const TabList = ({ activeTab = "All" }: { activeTab?: string }) => (
  <View className="border-b border-gray-200">
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          activeOpacity={0.7}
          className="mr-6 pb-2 items-center relative"
        >
          <Text
            className={`text-sm ${
              tab === activeTab
                ? "text-primary-dark font-inter-bold"
                : "text-gray-500"
            }`}
          >
            {tab}
          </Text>
          {tab === activeTab && (
            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
          {TAB_BADGES[tab] && (
            <View className="absolute -top-1 -right-3 bg-primary rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-[10px]">{TAB_BADGES[tab]}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const EmptyState = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}) => (
  <View className="flex-1 items-center justify-center px-8 py-20">
    <Store size={64} color="#d1d5db" strokeWidth={1.5} />
    <Text className="text-lg font-bold text-gray-400 mt-4 text-center">
      {title}
    </Text>
    {subtitle && (
      <Text className="text-sm text-gray-400 mt-2 text-center">{subtitle}</Text>
    )}
    {action && (
      <TouchableOpacity
        onPress={action.onPress}
        activeOpacity={0.8}
        className="mt-6 bg-primary px-8 py-3 rounded-xl shadow-sm"
      >
        <Text className="text-white font-inter-bold text-sm">
          {action.label}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const OrderCard = React.memo(
  ({
    item,
    onStatusPress,
  }: {
    item: OrderItem;
    onStatusPress?: (orderId: string) => void;
  }) => {
    const isDelivered = item.order_status === "Delivered";
    const statusColor = isDelivered ? "text-green-500" : "text-orange-500";
    const actionLabel = isDelivered ? "Buy Again" : "Pay Now";

    const { mutate: addToCart, flushPendingCart } = useAddtoCart();

    const handleActionPress = useCallback(() => {
      if (isDelivered) {
        addToCart(item?.variationid, 1);
        flushPendingCart();
        router.navigate("/cartlist");
      } else {
        router.navigate({
          pathname: "/cartlist",
          params: { orderId: item.orderid },
        });
      }
    }, [isDelivered, addToCart, item, flushPendingCart]);

    return (
      <View className="mt-2 p-4 bg-white">
        {/* Store header */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-red-50 items-center justify-center rounded-full mr-2">
              <Store size={14} color="#ef4444" />
            </View>
            <Text className="font-bold text-gray-800">
              Ram's Clothing Store
            </Text>
            <ChevronRight size={16} color="#9ca3af" strokeWidth={2.5} />
          </View>
          <TouchableOpacity
            onPress={() => onStatusPress?.(item?.ordermasterid)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-row items-center gap-0.5"
          >
            <Text className={`font-medium ${statusColor}`}>
              {item.order_status}
            </Text>
            <ChevronRight
              size={14}
              color="#9ca3af"
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Delivery info */}
        {item.time && (
          <TouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: "/deliverymap",
                params: { orderId: item?.orderid },
              })
            }
            activeOpacity={0.7}
            className="flex-row items-center bg-primary-tint p-2.5 rounded-lg mb-3 justify-between"
          >
            <View className="flex-row items-center">
              <Truck size={16} color="#b5860f" strokeWidth={2} />
              <Text className="text-xs text-primary-dark font-medium ml-2">
                Delivered on {item.time.split(" ")[0]}
              </Text>
            </View>
            <ChevronRight size={14} color="#b5860f" />
          </TouchableOpacity>
        )}

        {/* Product info */}
        <View className="flex-row">
          <Image
            source={{ uri: item.image }}
            className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100"
            resizeMode="cover"
          />
          <View className="flex-1 ml-3">
            <Text
              className="text-sm font-medium text-gray-900"
              numberOfLines={2}
            >
              {item.productname}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Variation: {item.variation}
            </Text>
            <Text className="text-primary-dark font-inter-bold mt-1">
              Rs. {item.price}
            </Text>
          </View>
          <Text className="font-bold text-sm self-end text-gray-600">
            Qty: {item.quantity}
          </Text>
        </View>

        {/* Footer */}
        <View className="items-end mt-4 border-t border-gray-100 pt-3">
          <Text className="text-xs text-gray-500">
            Total({item.quantity} items):
            <Text className="font-bold text-gray-900">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </Text>
          </Text>
          <View className="flex-row mt-3">
            <TouchableOpacity
              activeOpacity={0.7}
              className="border border-gray-300 px-4 py-2.5 rounded-lg mr-2"
            >
              <Text className="text-gray-600 text-xs font-medium">
                Return/Refund
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleActionPress}
              activeOpacity={0.8}
              className="bg-primary px-6 py-2.5 rounded-lg"
            >
              <Text className="text-white text-xs font-inter-bold">
                {actionLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

OrderCard.displayName = "OrderCard";

const Order = () => {
  const token = useAuthStore((s) => s.token);
  const [refreshing, setRefreshing] = useState(false);
  const [statusOrderId, setStatusOrderId] = useState<string | null>(null);

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

  const handleCartPress = useCallback(() => {
    router.navigate("/cartlist");
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OrderItem }) => (
      <OrderCard item={item} onStatusPress={setStatusOrderId} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: OrderItem, index: number) => `${item.productname}-${index}`,
    [],
  );

  // ─── Not logged in ─────────────────────────────────────────────
  if (!token) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <Header />
        <SearchBar />
        <EmptyState
          title="No Orders Found"
          subtitle="Please log in to view your orders"
          action={{ label: "Log In", onPress: () => router.navigate("/login") }}
        />
      </View>
    );
  }

  // ─── Loading ───────────────────────────────────────────────────
  if (isPending) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <Header />
        <SearchBar />
        <TabList />
        <FlatList
          data={[]}
          renderItem={() => null}
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

  // ─── Loaded ────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <Header showBack onCartPress={handleCartPress} />
      <SearchBar />
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={<TabList />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#d7a11b" />
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyState title="No Orders Found" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d7a11b"
            colors={["#d7a11b"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-2 bg-gray-100" />}
      />

      <OrderStatusBottomSheet
        orderMasterId={statusOrderId}
        onClose={() => setStatusOrderId(null)}
      />
    </View>
  );
};

export default Order;
